import pathlib
from supabase import create_client

root = pathlib.Path(r'D:\visionx\Vision_X\backend')
env_path = root / '.env'
values = {}
for line in env_path.read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    values[key.strip()] = value.strip().strip('"').strip("'")

supabase_url = values.get('SUPABASE_URL')
supabase_service_key = values.get('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not supabase_service_key:
    raise SystemExit('Missing Supabase credentials in backend/.env')

client = create_client(supabase_url, supabase_service_key)

bucket_name = 'visionx-video-reports'
existing_buckets = {getattr(bucket, 'name', None) for bucket in client.storage.list_buckets()}
if bucket_name not in existing_buckets:
    client.storage.create_bucket(bucket_name)
    print(f'Created bucket: {bucket_name}')
else:
    print(f'Bucket already exists: {bucket_name}')

for bucket in client.storage.list_buckets():
    print(getattr(bucket, 'name', None), getattr(bucket, 'public', None), getattr(bucket, 'id', None))
