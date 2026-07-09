import os, requests
from dotenv import load_dotenv
load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY')
r = requests.get(f'{url}/rest/v1/analysis_jobs?select=*&limit=1', headers={'apikey': key, 'Authorization': f'Bearer {key}'})
print(r.status_code)
data = r.json()
if data:
    print('columns:', list(data[0].keys()))
else:
    print('no rows')
    # try to get columns via schema endpoint if available
    r2 = requests.get(f'{url}/rest/v1/analysis_jobs?select=*&limit=0', headers={'apikey': key, 'Authorization': f'Bearer {key}', 'Accept': 'application/json'})
    print('empty query status', r2.status_code)
    print(r2.text[:300])