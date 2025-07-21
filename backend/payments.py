from backend.audit_log import log_audit

def process_payment(user, amount, phone):
    log_audit('payment', user, f'amount={amount}, phone={phone}') 