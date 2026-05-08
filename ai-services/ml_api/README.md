## Fake Profile Detection API (Python)

### Endpoints
- `POST /predict`: returns `{ classification: 0|1|2, confidence, reasons, features }`
- `GET /health`

### Run
From `job-portal/ai-services/ml_api`:

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7002
```

### Train (optional)
Prepare a CSV with numeric feature columns and `label` (0/1/2). Then:

```bash
python train.py --csv data/labeled_profiles.csv
```

This writes `model.joblib`. If no model is present, the service uses an explainable rule-based fallback.

