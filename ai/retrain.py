import subprocess

print('Fetching latest data from Supabase...')
subprocess.run(['python', 'supabase_fetch.py'], check=True)
print('Data fetch complete.')

print('Retraining model...')
subprocess.run(['python', 'train.py'], check=True)
print('Retraining complete. Model is up to date.') 