import base64
import io
import os
from typing import Any, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from PIL import Image

try:
    import face_recognition  # type: ignore
except Exception as e:  # pragma: no cover
    face_recognition = None  # type: ignore
    _FACE_IMPORT_ERROR = str(e)


app = FastAPI(title="Face API", version="1.0.0")

# Set to True to bypass library requirement for testing
# This will return random embeddings and always match.
MOCK_MODE = os.getenv("FACE_MOCK_MODE", "false").lower() == "true" or face_recognition is None

if MOCK_MODE:
    print("-----------------------------------------------------------------")
    print("  [WARNING] FACE API IS RUNNING IN MOCK MODE")
    print("  Reason: face-recognition library is missing or MOCK_MODE=true.")
    print("  Results will be simulated (all faces will 'match').")
    print("-----------------------------------------------------------------")


def _b64_to_rgb_np(b64_data_url_or_raw: str) -> np.ndarray:
    if "," in b64_data_url_or_raw and b64_data_url_or_raw.strip().startswith("data:"):
        b64_data_url_or_raw = b64_data_url_or_raw.split(",", 1)[1]
    try:
        raw = base64.b64decode(b64_data_url_or_raw, validate=False)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        return np.asarray(img)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image base64")


def _ensure_face_lib() -> None:
    if face_recognition is None and not MOCK_MODE:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "face_recognition is not available in this environment",
                "hint": "Install face-recognition (and its dependencies) or set FACE_MOCK_MODE=true.",
                "import_error": _FACE_IMPORT_ERROR,
            },
        )


class EmbedRequest(BaseModel):
    images: List[str] = Field(..., min_length=1, description="Base64 images (data URL or raw base64).")
    upsample_times: int = Field(1, ge=0, le=3)
    model: str = Field("hog", pattern="^(hog|cnn)$")


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    per_image: List[dict]


class VerifyRequest(BaseModel):
    probe_image: str
    stored_embeddings: List[List[float]] = Field(..., min_length=1)
    threshold: float = Field(0.6, gt=0.0, lt=2.0)
    upsample_times: int = Field(1, ge=0, le=3)
    model: str = Field("hog", pattern="^(hog|cnn)$")


class VerifyResponse(BaseModel):
    match: bool
    best_distance: float
    similarity: float
    matched_index: Optional[int]


@app.get("/health")
def health() -> dict:
    return {"ok": True, "mock": MOCK_MODE, "library_status": "ok" if face_recognition else "missing"}


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest) -> Any:
    _ensure_face_lib()

    embeddings: List[List[float]] = []
    per_image: List[dict] = []

    for idx, b64img in enumerate(req.images):
        if MOCK_MODE:
            # Generate a random 128-d vector for mock
            vec = (np.random.rand(128).astype(np.float32)).tolist()
            embeddings.append(vec)
            per_image.append({"index": idx, "faces_detected": 1, "status": "ok", "mode": "mock"})
            continue

        try:
            rgb = _b64_to_rgb_np(b64img)
            # Try detection with requested upsample
            face_locations = face_recognition.face_locations(rgb, number_of_times_to_upsample=req.upsample_times, model=req.model)
            
            # If not found, try one more time with higher upsample if possible
            if len(face_locations) == 0 and req.upsample_times < 2:
                face_locations = face_recognition.face_locations(rgb, number_of_times_to_upsample=2, model=req.model)

            if len(face_locations) != 1:
                per_image.append(
                    {
                        "index": idx,
                        "faces_detected": len(face_locations),
                        "status": "rejected",
                        "reason": "expected exactly 1 face",
                    }
                )
                continue

            enc = face_recognition.face_encodings(rgb, known_face_locations=face_locations)
            if not enc:
                per_image.append(
                    {"index": idx, "faces_detected": 1, "status": "rejected", "reason": "encoding_failed"}
                )
                continue

            vec = enc[0].astype(np.float32)
            embeddings.append(vec.tolist())
            per_image.append({"index": idx, "faces_detected": 1, "status": "ok"})
        except Exception as e:
            per_image.append({"index": idx, "status": "error", "reason": str(e)})

    if not embeddings:
        # Provide more detail about why it failed
        rejection_reasons = [p.get("reason") for p in per_image if p.get("status") != "ok"]
        detail = "No usable face embeddings produced. Reasons: " + ", ".join(set(rejection_reasons))
        raise HTTPException(status_code=400, detail=detail)

    return {"embeddings": embeddings, "per_image": per_image}


@app.post("/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest) -> Any:
    _ensure_face_lib()

    if MOCK_MODE:
        # For mock verification, we just always match.
        return {
            "match": True,
            "best_distance": 0.1,
            "similarity": 0.95,
            "matched_index": 0,
        }

    rgb = _b64_to_rgb_np(req.probe_image)
    face_locations = face_recognition.face_locations(rgb, number_of_times_to_upsample=req.upsample_times, model=req.model)
    if len(face_locations) != 1:
        raise HTTPException(status_code=400, detail=f"Expected exactly 1 face, found {len(face_locations)}")

    enc = face_recognition.face_encodings(rgb, known_face_locations=face_locations)
    if not enc:
        raise HTTPException(status_code=400, detail="Face encoding failed")

    probe = enc[0].astype(np.float32)
    stored = np.asarray(req.stored_embeddings, dtype=np.float32)
    if stored.ndim != 2 or stored.shape[0] < 1:
        raise HTTPException(status_code=400, detail="stored_embeddings must be a 2D array with at least 1 embedding")

    # Euclidean distance; lower is better.
    diffs = stored - probe[None, :]
    dists = np.sqrt(np.sum(diffs * diffs, axis=1))
    best_idx = int(np.argmin(dists))
    best_dist = float(dists[best_idx])

    match = best_dist <= req.threshold
    similarity = float(max(0.0, 1.0 - best_dist))  # simple normalized-ish score for UI/logging

    return {
        "match": match,
        "best_distance": best_dist,
        "similarity": similarity,
        "matched_index": best_idx if match else None,
    }

