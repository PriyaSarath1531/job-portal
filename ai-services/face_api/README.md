## Face API (Python)

### What it does
- `POST /embed`: accepts multiple base64 images, returns face embeddings (job seeker enrollment).
- `POST /verify`: accepts a live base64 image + stored embeddings, returns match result + similarity.

### Run locally
From `job-portal/ai-services/face_api`:

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7001
```

### Notes (Windows)
`face-recognition` depends on `dlib` and may be difficult to install on Windows. If pip fails, the recommended approach is to run this service in Docker/Linux.

