from dotenv import load_dotenv
import os
from pathlib import Path

# Explicitly load .env from the script's directory
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

print("TWILIO_ACCOUNT_SID:", os.environ.get("TWILIO_ACCOUNT_SID"))
print("TWILIO_AUTH_TOKEN:", os.environ.get("TWILIO_AUTH_TOKEN"))
print("TWILIO_WHATSAPP_FROM:", os.environ.get("TWILIO_WHATSAPP_FROM"))
print("TWILIO_FROM_NUMBER:", os.environ.get("TWILIO_FROM_NUMBER"))

load_dotenv()
print("MPESA_CONSUMER_KEY:", os.getenv("MPESA_CONSUMER_KEY"))
print("MPESA_CONSUMER_SECRET:", os.getenv("MPESA_CONSUMER_SECRET"))
print("MPESA_SHORTCODE:", os.getenv("MPESA_SHORTCODE"))
print("MPESA_PASSKEY:", os.getenv("MPESA_PASSKEY"))
print("MPESA_BASE_URL:", os.getenv("MPESA_BASE_URL")) 