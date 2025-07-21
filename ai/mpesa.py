import os
import requests
from fastapi import APIRouter, HTTPException, Request, Header
from dotenv import load_dotenv
import logging
from datetime import datetime
import base64

load_dotenv()

router = APIRouter()

MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")

API_KEY = os.getenv("BACKEND_API_KEY", "testkey")

logging.basicConfig(filename='audit.log', level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

print("CWD:", os.getcwd())
print("ENV FILE EXISTS:", os.path.exists(".env"))

# 1. Access Token Endpoint (for testing/demo)
@router.get("/mpesa/token")
async def get_mpesa_token(x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    logging.info(f"MPESA TOKEN REQUESTED: user=API_KEY")
    url = f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(url, auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET))
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=500, detail="Failed to get access token")

# 2. Initiate STK Push
@router.post("/mpesa/stkpush")
async def initiate_stk_push(request: Request, x_api_key: str = Header(...)):
    verify_api_key(x_api_key)
    data = await request.json()
    logging.info(f"MPESA STK PUSH: user=API_KEY, data={data}")
    phone = data.get("phone")
    amount = data.get("amount")
    if not phone or not amount:
        raise HTTPException(status_code=400, detail="Phone and amount are required")
    # Get access token
    token_url = f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    token_resp = requests.get(token_url, auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET))
    if token_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to get access token")
    access_token = token_resp.json().get("access_token")
    # Prepare STK push payload
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()
    stk_url = f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": "https://webhook.site/your-callback-url",  # Replace with your callback
        "AccountReference": "AfyaJiraniOnboarding",
        "TransactionDesc": "Hospital Onboarding Fee"
    }
    resp = requests.post(stk_url, json=payload, headers=headers)
    return resp.json()

# 3. Callback Endpoint
@router.post("/mpesa/callback")
async def mpesa_callback(request: Request):
    data = await request.json()
    # For demo, just print/log the callback
    print("M-Pesa Callback Received:", data)
    return {"status": "received"} 