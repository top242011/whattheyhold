import os
from supabase import create_client, Client
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
import ssl
import mimetypes

# Bypass SSL verify on macOS
ssl_context = ssl._create_unverified_context()

SUPABASE_URL = "https://mzvqhtwtnqnbrussgsiq.supabase.co"
# The service role key retrieved from CLI
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnFodHd0bnFuYnJ1c3Nnc2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzOTY3OCwiZXhwIjoyMDg2OTE1Njc4fQ.VS_QZRi2OcsXCSNhB71Xa9nqPbxMLufBabpEL-KBJkY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ISSUERS = {
    "vanguard": "vanguard.com",
    "invesco": "invesco.com",
    "blackrock": "blackrock.com",
    "ishares": "ishares.com",
    "spdr": "ssga.com",
    "state_street": "statestreet.com",
    "fidelity": "fidelity.com",
    "ark": "ark-funds.com",
    "wisdomtree": "wisdomtree.com",
    "charles_schwab": "schwab.com",
    "global_x": "globalxetfs.com"
}

os.makedirs("logos", exist_ok=True)

# 1. Create bucket if it doesn't exist
try:
    buckets = supabase.storage.list_buckets()
    bucket_names = [b.name for b in buckets]
    if "logos" not in bucket_names:
        print("Creating 'logos' bucket...")
        # The python client signature might expect only ID or ID and Options.
        supabase.storage.create_bucket("logos", name="logos", options={"public": True})
        print("Bucket created.")
    else:
        print("'logos' bucket already exists.")
except Exception as e:
    print(f"Bucket check/create failed: {e}")

# 2. Download and upload logos
for name, domain in ISSUERS.items():
    print(f"Processing {name} ({domain})...")
    # Using Google Favicons instead of Clearbit (which was failing DNS resolution)
    url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urlopen(req, context=ssl_context) as res:
            content = res.read()
            filepath = f"logos/{name}.png"
            with open(filepath, "wb") as f:
                f.write(content)
            print(f"Downloaded {name}.png")
            
            # Upload to Supabase Storage
            try:
                # Check if file exists, if yes, update it; otherwise upload
                with open(filepath, 'rb') as f:
                    try:
                        supabase.storage.from_('logos').upload(f"{name}.png", f, {"content-type": "image/png"})
                        print(f"Uploaded {name}.png to Supabase.")
                    except Exception as upload_err:
                        if "Duplicate" in str(upload_err) or "already exists" in str(upload_err).lower() or hasattr(upload_err, "code") and getattr(upload_err, "code") == "409":
                            # File exists, maybe update it instead or skip
                            print(f"{name}.png already exists in bucket, skipping upload.")
                        else:
                            print(f"Upload failed for {name}.png: {upload_err}")
            except Exception as e:
                print(f"Supabase storage error for {name}: {e}")
                
    except HTTPError as e:
        print(f"HTTPError: {e.code} for {name}")
    except URLError as e:
        print(f"URLError: {e.reason} for {name}")

print("Done.")
