import logging
from datetime import datetime

def log_audit(action: str, user: str, details: str):
    logging.basicConfig(filename='audit.log', level=logging.INFO, format='%(asctime)s %(message)s')
    log_entry = f"ACTION={action} USER={user} DETAILS={details}"
    logging.info(log_entry) 