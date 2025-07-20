import subprocess
import sys

print('Fetching latest data from Supabase...')
subprocess.run([sys.executable, 'supabase_fetch.py'], check=True)
print('Data fetch complete.')

print('Retraining model...')
subprocess.run([sys.executable, 'train.py'], check=True)
print('Retraining complete. Model is up to date.') 