from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from datetime import datetime, timedelta
import pandas as pd
import os

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load available diseases
with open('diseases.txt') as f:
    DISEASES = [line.strip() for line in f if line.strip()]

# Helper to load model and start_date for a disease
def load_model_for_disease(disease):
    path = f'model_{disease}.pkl'
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"No model found for disease: {disease}")
    data = joblib.load(path)
    return data['model'], pd.to_datetime(data['start_date'])

@app.get("/predict")
def predict(
    disease: str = Query(..., description="Disease to predict"),
    days_from_now: int = Query(None, description="Days from today to predict case count for"),
    range: int = Query(None, description="If set, returns predictions for the next N days")
):
    if disease not in DISEASES:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not found. Available: {DISEASES}")
    model, start_date = load_model_for_disease(disease)
    today = datetime.today()
    days_since_start = (today - start_date).days
    results = {}
    if range is not None:
        preds = []
        for i in range(range):
            ds = days_since_start + i
            pred = model.predict(np.array([[ds]]))[0]
            preds.append({"days_from_now": i, "predicted_cases": float(pred)})
        results['predictions'] = preds
    elif days_from_now is not None:
        ds = days_since_start + days_from_now
        pred = model.predict(np.array([[ds]]))[0]
        results['predicted_cases'] = float(pred)
        results['days_from_now'] = days_from_now
    else:
        raise HTTPException(status_code=400, detail="Must provide days_from_now or range parameter.")
    results['disease'] = disease
    return results 