from dotenv import load_dotenv
import os
from pathlib import Path

# Explicitly load .env from the script's directory
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

print("TWILIO_ACCOUNT_SID:", os.environ.get("TWILIO_ACCOUNT_SID"))
print("TWILIO_AUTH_TOKEN:", os.environ.get("TWILIO_AUTH_TOKEN"))
print("TWILIO_WHATSAPP_FROM:", os.environ.get("TWILIO_WHATSAPP_FROM"))
print("TWILIO_FROM_NUMBER:", os.environ.get("TWILIO_FROM_NUMBER")) 