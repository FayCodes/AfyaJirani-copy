import os
import pandas as pd
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def fetch_cases():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError('Set SUPABASE_URL and SUPABASE_KEY environment variables.')
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = supabase.table('cases').select('*').execute()
    data = response.data
    df = pd.DataFrame(data)
    df.to_csv('cases.csv', index=False)
    print(f"Fetched {len(df)} cases and saved to cases.csv")

if __name__ == '__main__':
    fetch_cases() 