from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from datetime import datetime, timedelta
import pandas as pd
import os
from collections import defaultdict
from pydantic import BaseModel
from supabase import create_client, Client
from twilio.rest import Client as TwilioClient
from dotenv import load_dotenv
load_dotenv()

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
with open('ai/diseases.txt') as f:
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
    predict_range: int = Query(None, description="If set, returns predictions for the next N days")
):
    if disease not in DISEASES:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not found. Available: {DISEASES}")
    model, start_date = load_model_for_disease(disease)
    today = datetime.today()
    days_since_start = (today - start_date).days
    results = {}
    # Load recent actual cases for trend/anomaly
    recent_actual = []
    try:
        df = pd.read_csv('cases.csv')
        df = df[df['disease'] == disease]
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        # Get last 14 days of actual cases
        last_14 = df[df['date'] >= (today - timedelta(days=14))]
        # Aggregate by day
        daily = last_14.groupby('date').size().reindex(
            pd.date_range(today - timedelta(days=13), today), fill_value=0
        )
        recent_actual = daily.values.tolist()
    except Exception:
        recent_actual = []
    if predict_range is not None:
        preds = []
        for i in range(predict_range):
            ds = days_since_start + i
            pred = model.predict(np.array([[ds]]))[0]
            preds.append({"days_from_now": i, "predicted_cases": float(pred)})
        # --- Trend Explanation ---
        trend_explanation = None
        if len(recent_actual) >= 14:
            prev7 = sum(recent_actual[:7])
            next7 = sum([p['predicted_cases'] for p in preds[:7]])
            if next7 > prev7 * 1.15:
                trend_explanation = "Cases are rising compared to last week."
            elif next7 < prev7 * 0.85:
                trend_explanation = "Cases are falling compared to last week."
            else:
                trend_explanation = "Cases are stable compared to last week."
        results['trend_explanation'] = trend_explanation
        # --- Anomaly Detection ---
        if len(recent_actual) >= 7:
            mean = np.mean(recent_actual[-7:])
            std = np.std(recent_actual[-7:])
            for p in preds:
                p['anomaly'] = abs(p['predicted_cases'] - mean) > 2 * std if std > 0 else False
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

# --- Risk Scoring Endpoint ---
@app.get("/risk")
def risk(
    location: str = Query(None, description="Location to filter by (optional)"),
    days: int = Query(14, description="Number of recent days to consider for risk scoring")
):
    try:
        df = pd.read_csv('cases.csv')
        df['date'] = pd.to_datetime(df['date'])
        if location:
            df = df[df['location'].str.lower() == location.lower()]
        recent = df[df['date'] >= (datetime.today() - timedelta(days=days))]
        all_time = df
        results = {}
        for disease in recent['disease'].unique():
            recent_cases = recent[recent['disease'] == disease]['cases'].sum()
            avg_cases = all_time[all_time['disease'] == disease]['cases'].sum() / max((all_time['date'].nunique()), 1)
            # Risk: compare recent to average
            if avg_cases == 0:
                risk = "Low"
            elif recent_cases > avg_cases * 2:
                risk = "High"
            elif recent_cases > avg_cases * 1.2:
                risk = "Medium"
            else:
                risk = "Low"
            results[disease] = {
                "recent_cases": int(recent_cases),
                "avg_daily_cases": float(f"{avg_cases:.2f}"),
                "risk": risk
            }
        return {"location": location, "risk_scores": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Hotspot Detection Endpoint ---
@app.get("/hotspots")
def hotspots(
    days: int = Query(7, description="Number of recent days to consider for hotspots"),
    min_cases: int = Query(3, description="Minimum cases to consider a hotspot")
):
    try:
        df = pd.read_csv('cases.csv')
        df['date'] = pd.to_datetime(df['date'])
        recent = df[df['date'] >= (datetime.today() - timedelta(days=days))]
        grouped = recent.groupby(['location', 'disease'])['cases'].sum().reset_index()
        # Calculate mean+std for each disease
        disease_stats = grouped.groupby('disease')['cases'].agg(['mean', 'std']).reset_index()
        stats_dict = {row['disease']: (row['mean'], row['std']) for _, row in disease_stats.iterrows()}
        hotspots = []
        for _, row in grouped.iterrows():
            mean, std = stats_dict[row['disease']]
            if row['cases'] >= min_cases and (std > 0 and row['cases'] > mean + std):
                hotspots.append({
                    "location": row['location'],
                    "disease": row['disease'],
                    "cases": int(row['cases']),
                    "risk": "High"
                })
        return {"hotspots": hotspots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Personalized Tips Endpoint ---
@app.get("/personalized-tips")
def personalized_tips(
    location: str = Query(None, description="Location to get tips for (optional)")
):
    # Hardcoded tips for now
    TIPS = {
        "Cholera": [
            "Drink only clean, boiled, or bottled water.",
            "Wash hands frequently with soap.",
            "Eat food that is thoroughly cooked."
        ],
        "Malaria": [
            "Sleep under insecticide-treated nets.",
            "Eliminate standing water near your home.",
            "Wear long-sleeved clothing at night."
        ],
        "COVID-19": [
            "Wear a mask in crowded places.",
            "Wash hands regularly.",
            "Maintain social distancing."
        ]
    }
    try:
        df = pd.read_csv('cases.csv')
        df['date'] = pd.to_datetime(df['date'])
        if location:
            df = df[df['location'].str.lower() == location.lower()]
        # Find most prevalent disease in recent 14 days
        recent = df[df['date'] >= (datetime.today() - timedelta(days=14))]
        if recent.empty:
            return {"tips": ["No recent cases found. General health tips: Wash hands, drink clean water, seek medical care if unwell."]}
        top_disease = recent.groupby('disease')['cases'].sum().idxmax()
        tips = TIPS.get(top_disease, ["Stay healthy and seek medical care if unwell."])
        return {"disease": top_disease, "tips": tips}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Alert Sending Endpoint ---
class AlertRequest(BaseModel):
    patient_ids: list[str]
    message: str
    channel: str = 'sms'  # 'sms' or 'whatsapp'

@app.post("/send-alert")
def send_alert(request: AlertRequest):
    try:
        print("Received alert request:", request)
        # Supabase setup
        SUPABASE_URL = os.environ.get('SUPABASE_URL')
        SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise HTTPException(status_code=500, detail='Supabase credentials not set')
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        # Fetch patients
        response = supabase.table('patients').select('id, phone').in_('id', request.patient_ids).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail='No patients found for given IDs')
        phones = [row['phone'] for row in response.data]
        # Twilio setup
        TWILIO_SID = os.environ.get('TWILIO_ACCOUNT_SID')
        TWILIO_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
        # For WhatsApp alerts, use the Twilio Sandbox number in the format 'whatsapp:+14155238886'
        # For SMS alerts, use your Twilio phone number in the format '+1XXXXXXXXXX'
        # Set these in your .env file as shown below:
        #   TWILIO_FROM_NUMBER=+1XXXXXXXXXX         # <-- Your Twilio SMS number
        #   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # <-- Twilio WhatsApp Sandbox number
        TWILIO_FROM_SMS = os.environ.get('TWILIO_FROM_NUMBER')
        TWILIO_FROM_WHATSAPP = os.environ.get('TWILIO_WHATSAPP_FROM')
        if not TWILIO_SID or not TWILIO_TOKEN or not (TWILIO_FROM_SMS and TWILIO_FROM_WHATSAPP):
            raise HTTPException(status_code=500, detail='Twilio credentials not set')
        twilio_client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
        results = []
        for phone in phones:
            if request.channel == 'whatsapp':
                to_number = f'whatsapp:{phone}'
                from_number = TWILIO_FROM_WHATSAPP
            else:
                to_number = phone
                from_number = TWILIO_FROM_SMS
            try:
                msg = twilio_client.messages.create(
                    body=request.message,
                    from_=from_number,
                    to=to_number
                )
                results.append({'phone': phone, 'status': 'sent', 'sid': msg.sid})
            except Exception as e:
                results.append({'phone': phone, 'status': 'error', 'error': str(e)})
        return {'results': results}
    except Exception as e:
        import traceback
        print("Error in /send-alert:", e)
        traceback.print_exc()
        raise 

# --- Case Reporting Endpoint ---
class CaseReportRequest(BaseModel):
    disease: str
    symptoms: str
    location: str
    age_group: str
    gender: str
    date: str  # ISO date string
    patient_code: str | None = None
    doctor_name: str
    clinic_name: str

@app.post("/report-case")
def report_case(request: CaseReportRequest):
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail='Supabase credentials not set')
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    # Insert the new case
    data = {
        "disease": request.disease,
        "symptoms": request.symptoms,
        "location": request.location,
        "age_group": request.age_group,
        "gender": request.gender,
        "date": request.date,
        "patient_code": request.patient_code,
        "doctor_name": request.doctor_name,
        "clinic_name": request.clinic_name,
    }
    try:
        response = supabase.table('cases').insert(data).execute()
        if response.error:
            raise HTTPException(status_code=500, detail=str(response.error))
        return {"success": True, "case_id": response.data[0]["id"] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 