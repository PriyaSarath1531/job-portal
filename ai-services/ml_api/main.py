from __future__ import annotations

import base64
import io
import math
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import cv2
import joblib
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from PIL import Image

MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "model.joblib"))
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
FACE_MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.6"))

try:
    face_detector = MTCNN(image_size=160, margin=20, device=DEVICE)
    face_model = InceptionResnetV1(pretrained="vggface2").eval().to(DEVICE)
except Exception as e:
    face_detector = None
    face_model = None
    print(f"Warning: Face model not loaded: {e}")

app = FastAPI(title="Job Portal AI Services", version="1.0.0")


class ProfilePayload(BaseModel):
    user_id: str
    role: str = Field(..., pattern="^(jobseeker|employer)$")

    # Common
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    avatar: Optional[str] = ""
    profile_completion_pct: Optional[float] = None

    # Job seeker
    resume: Optional[str] = ""
    education: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = 0
    resume_duplicate_count: Optional[int] = 0
    skill_experience_mismatch: Optional[float] = 0.0
    multiple_accounts_same_ip_count: Optional[int] = 0
    face_mismatch_attempts: Optional[int] = 0
    unrealistic_patterns_score: Optional[float] = 0.0

    # Employer / recruiter
    company_name: Optional[str] = ""
    company_website: Optional[str] = ""
    company_email: Optional[str] = ""
    job_postings_count: Optional[int] = 0
    urgent_hiring_count: Optional[int] = 0
    suspicious_contact_count: Optional[int] = 0


class PredictRequest(BaseModel):
    profile: ProfilePayload


class PredictResponse(BaseModel):
    classification: int
    confidence: float
    reasons: List[str]
    features: Dict[str, float]


class FaceEnrollRequest(BaseModel):
    image: str


class FaceEnrollResponse(BaseModel):
    embedding: List[float]
    descriptor: str
    success: bool


class FaceVerifyRequest(BaseModel):
    image: str
    enrollment: str


class FaceVerifyResponse(BaseModel):
    match: bool
    confidence: float
    message: str


def _safe_len(x) -> int:
    return len(x) if x else 0


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _profile_completion_jobseeker(profile: ProfilePayload) -> float:
    fields = [
        bool(profile.name),
        bool(profile.email),
        bool(profile.phone),
        bool(profile.avatar),
        bool(profile.resume),
        _safe_len(profile.education) > 0,
        _safe_len(profile.skills) > 0,
        (profile.experience_years or 0) > 0,
    ]
    return (sum(1 for f in fields if f) / len(fields)) * 100.0


def _profile_completion_employer(profile: ProfilePayload) -> float:
    fields = [
        bool(profile.name),
        bool(profile.email),
        bool(profile.phone),
        bool(profile.avatar),
        bool(profile.company_name),
        bool(profile.company_website),
        bool(profile.company_email),
        (profile.job_postings_count or 0) > 0,
    ]
    return (sum(1 for f in fields if f) / len(fields)) * 100.0


def extract_features(profile: ProfilePayload) -> Tuple[Dict[str, float], List[str]]:
    reasons: List[str] = []

    if profile.role == "employer":
        completion = (
            float(profile.profile_completion_pct)
            if profile.profile_completion_pct is not None
            else _profile_completion_employer(profile)
        )

        company_name = bool(profile.company_name)
        website = bool(profile.company_website)
        email = (profile.company_email or "").strip().lower()
        free_mail = any(domain in email for domain in ("gmail.com", "yahoo.com", "hotmail.com", "outlook.com"))

        job_posts = float(profile.job_postings_count or 0)
        urgent_hiring = float(profile.urgent_hiring_count or 0)
        suspicious_contact = float(profile.suspicious_contact_count or 0)

        if completion < 45:
            reasons.append("Low company profile completion")
        if not company_name:
            reasons.append("Missing company name")
        if not website:
            reasons.append("Missing company website")
        if free_mail:
            reasons.append("Uses free email domain")
        if urgent_hiring >= 3:
            reasons.append("High urgent hiring activity")
        if suspicious_contact >= 2:
            reasons.append("Suspicious contact pattern")

        features = {
            "profile_completion_pct": completion,
            "company_name_present": float(company_name),
            "company_website_present": float(website),
            "free_email_domain": float(free_mail),
            "job_postings_count": job_posts,
            "urgent_hiring_count": urgent_hiring,
            "suspicious_contact_count": suspicious_contact,
        }
        return features, reasons

    completion = (
        float(profile.profile_completion_pct)
        if profile.profile_completion_pct is not None
        else _profile_completion_jobseeker(profile)
    )

    resume_dup = float(profile.resume_duplicate_count or 0)
    face_mismatch = float(profile.face_mismatch_attempts or 0)
    multi_ip = float(profile.multiple_accounts_same_ip_count or 0)
    mismatch = float(profile.skill_experience_mismatch or 0.0)
    unrealistic = float(profile.unrealistic_patterns_score or 0.0)

    skills_count = float(_safe_len(profile.skills))
    edu_count = float(_safe_len(profile.education))
    exp_years = float(profile.experience_years or 0.0)

    skills_per_edu = skills_count / max(1.0, edu_count)
    skills_per_year = skills_count / max(1.0, exp_years)

    if completion < 45:
        reasons.append("Low profile completion")
    if resume_dup >= 1:
        reasons.append("Resume appears duplicated across accounts")
    if mismatch >= 0.7:
        reasons.append("Skills vs experience mismatch")
    if multi_ip >= 1:
        reasons.append("Multiple accounts detected from same IP")
    if face_mismatch >= 3:
        reasons.append("Repeated face mismatch attempts")
    if unrealistic >= 0.7:
        reasons.append("Unrealistic or inconsistent profile patterns")

    features = {
        "profile_completion_pct": completion,
        "resume_duplicate_count": resume_dup,
        "skill_experience_mismatch": mismatch,
        "skills_count": skills_count,
        "education_count": edu_count,
        "experience_years": exp_years,
        "skills_per_education": skills_per_edu,
        "skills_per_year": skills_per_year,
        "multiple_accounts_same_ip_count": multi_ip,
        "face_mismatch_attempts": face_mismatch,
        "unrealistic_patterns_score": unrealistic,
    }
    return features, reasons


@dataclass
class LoadedModel:
    model: Any
    feature_order: List[str]


def load_model() -> Optional[LoadedModel]:
    if not os.path.exists(MODEL_PATH):
        return None

    try:
        obj = joblib.load(MODEL_PATH)

        if isinstance(obj, dict) and "model" in obj:
            model = obj["model"]
            feature_order = list(obj.get("feature_order") or getattr(model, "feature_names_in_", []))
            if not feature_order:
                return None
            return LoadedModel(model=model, feature_order=feature_order)

        if hasattr(obj, "predict"):
            feature_order = list(getattr(obj, "feature_names_in_", []))
            return LoadedModel(model=obj, feature_order=feature_order)

        print("Warning: model.joblib format invalid.")
        return None
    except Exception as e:
        print(f"Warning: failed to load model.joblib: {e}")
        return None


_LOADED = load_model()


def rule_based_predict_jobseeker(features: Dict[str, float]) -> Tuple[int, float]:
    score = 0.0

    completion = features["profile_completion_pct"]
    if completion < 30:
        score += 2.0
    elif completion < 45:
        score += 1.0

    score += min(2.0, features["resume_duplicate_count"] * 1.5)
    score += min(2.0, features["multiple_accounts_same_ip_count"] * 1.0)
    score += min(2.0, features["face_mismatch_attempts"] * 0.4)

    if features["skill_experience_mismatch"] >= 0.7:
        score += 1.5

    score += _clamp(features["unrealistic_patterns_score"], 0.0, 1.0) * 1.5

    if score < 1.5:
        cls = 0
    elif score < 3.5:
        cls = 1
    else:
        cls = 2

    conf = float(_clamp(1.0 - math.exp(-score / 2.0), 0.5, 0.99))
    if cls == 0:
        conf = float(_clamp(1.0 - conf, 0.55, 0.95))
    return cls, conf


def rule_based_predict_employer(features: Dict[str, float]) -> Tuple[int, float]:
    score = 0.0

    if features["profile_completion_pct"] < 45:
        score += 1.5
    if features["company_name_present"] < 1:
        score += 1.5
    if features["company_website_present"] < 1:
        score += 2.0
    if features["free_email_domain"] >= 1:
        score += 1.5
    if features["job_postings_count"] >= 20:
        score += 1.0
    if features["urgent_hiring_count"] >= 3:
        score += 1.0
    if features["suspicious_contact_count"] >= 2:
        score += 1.5

    if score < 2.0:
        cls = 0
    elif score < 4.0:
        cls = 1
    else:
        cls = 2

    conf = float(_clamp(1.0 - math.exp(-score / 2.2), 0.5, 0.99))
    if cls == 0:
        conf = float(_clamp(1.0 - conf, 0.55, 0.95))
    return cls, conf


def base64_to_image(image_data: str) -> np.ndarray:
    try:
        if "," in image_data and image_data.startswith("data:image"):
            image_data = image_data.split(",", 1)[1].strip()

        image_bytes = base64.b64decode(image_data, validate=False)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")


def get_face_embedding(image: np.ndarray) -> List[float]:
    if face_model is None:
        raise HTTPException(status_code=500, detail="Face model not available")

    try:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(rgb)

        if face_detector is not None:
            face_tensor = face_detector(pil_image)
            if face_tensor is None:
                raise HTTPException(status_code=400, detail="No face detected in image")
            if face_tensor.ndim == 3:
                face_tensor = face_tensor.unsqueeze(0)
            face_tensor = face_tensor.to(DEVICE)
        else:
            pil_image = pil_image.resize((160, 160))
            arr = np.array(pil_image).astype(np.float32)
            face_tensor = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0).to(DEVICE)
            face_tensor = (face_tensor - 127.5) / 128.0

        with torch.no_grad():
            embedding = face_model(face_tensor)

        emb = embedding.detach().cpu().numpy().reshape(-1).astype(np.float32)
        if emb.size == 0:
            raise HTTPException(status_code=400, detail="Empty face embedding")
        return emb.tolist()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face extraction failed: {str(e)}")


def compare_embeddings(emb1: List[float], emb2: List[float]) -> float:
    a = np.array(emb1, dtype=np.float32)
    b = np.array(emb2, dtype=np.float32)

    norm1 = np.linalg.norm(a)
    norm2 = np.linalg.norm(b)
    if norm1 == 0 or norm2 == 0:
        return 0.0

    sim = float(np.dot(a, b) / (norm1 * norm2))
    return float(_clamp(sim, -1.0, 1.0))


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "fake_profile_model_loaded": _LOADED is not None,
        "face_model_loaded": face_model is not None,
        "device": str(DEVICE),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> Any:
    profile = req.profile
    features, reasons = extract_features(profile)

    if profile.role == "employer":
        cls, conf = rule_based_predict_employer(features)
        return {
            "classification": int(cls),
            "confidence": float(conf),
            "reasons": reasons if reasons else ["Employer profile checked"],
            "features": {k: float(v) for k, v in features.items()},
        }

    if _LOADED is None:
        cls, conf = rule_based_predict_jobseeker(features)
        return {
            "classification": int(cls),
            "confidence": float(conf),
            "reasons": reasons if reasons else ["No strong risk indicators"],
            "features": {k: float(v) for k, v in features.items()},
        }

    try:
        if _LOADED.feature_order:
            x = np.array([[features.get(name, 0.0) for name in _LOADED.feature_order]], dtype=np.float32)
            model = _LOADED.model

            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(x)[0]
                cls = int(np.argmax(proba))
                conf = float(np.max(proba))
            else:
                cls = int(model.predict(x)[0])
                conf = 0.75

            return {
                "classification": cls,
                "confidence": conf,
                "reasons": reasons if reasons else ["Model-based decision"],
                "features": {k: float(v) for k, v in features.items()},
            }

        cls, conf = rule_based_predict_jobseeker(features)
        return {
            "classification": int(cls),
            "confidence": float(conf),
            "reasons": reasons if reasons else ["Fallback decision"],
            "features": {k: float(v) for k, v in features.items()},
        }
    except Exception as e:
        cls, conf = rule_based_predict_jobseeker(features)
        return {
            "classification": int(cls),
            "confidence": float(conf),
            "reasons": reasons + [f"Model fallback: {str(e)}"],
            "features": {k: float(v) for k, v in features.items()},
        }


@app.post("/face/enroll", response_model=FaceEnrollResponse)
def enroll_face(req: FaceEnrollRequest):
    image = base64_to_image(req.image)
    embedding = get_face_embedding(image)
    descriptor = base64.b64encode(np.array(embedding, dtype=np.float32).tobytes()).decode("utf-8")
    return {"embedding": embedding, "descriptor": descriptor, "success": True}


@app.post("/face/verify", response_model=FaceVerifyResponse)
def verify_face(req: FaceVerifyRequest):
    current_image = base64_to_image(req.image)
    current_embedding = get_face_embedding(current_image)

    try:
        enrollment_bytes = base64.b64decode(req.enrollment, validate=False)
        if len(enrollment_bytes) < 4:
            raise ValueError("Invalid enrollment descriptor")
        enrolled_embedding = np.frombuffer(enrollment_bytes, dtype=np.float32).tolist()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid enrollment descriptor: {str(e)}")

    similarity = compare_embeddings(current_embedding, enrolled_embedding)
    match = similarity >= FACE_MATCH_THRESHOLD

    return {
        "match": match,
        "confidence": float(_clamp(similarity, 0.0, 1.0)),
        "message": "Face verified" if match else "Face mismatch",
    }

