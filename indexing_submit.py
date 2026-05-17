#!/usr/bin/env python3
import json, time, sys
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SCOPES = ["https://www.googleapis.com/auth/indexing"]
ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
SA_PATH = "/home/ubuntu/.openclaw/workspace/.gcp-service-account.json"

URLS = [
    # Hub pages
    "https://www.bartact.com/pages/jeep-seat-covers",
    "https://www.bartact.com/pages/jeep-wrangler-accessories",
    "https://www.bartact.com/pages/jeep-gladiator-accessories",
    "https://www.bartact.com/pages/ford-bronco-accessories",
    "https://www.bartact.com/pages/toyota-tacoma-accessories",
    "https://www.bartact.com/pages/molle-accessories-guide",
    "https://www.bartact.com/pages/paracord-grab-handles",
    "https://www.bartact.com/pages/tactical-seat-covers",
    # Cannibalization-fixed collections
    "https://www.bartact.com/collections/jeep-wrangler-seat-covers-accessories",
    "https://www.bartact.com/collections/jeep-wrangler-seat-covers",
    "https://www.bartact.com/collections/winch-covers",
    "https://www.bartact.com/collections/winch-covers-patent-pending-by-bartact",
    "https://www.bartact.com/collections/toyota-tacoma-seat-covers",
    "https://www.bartact.com/collections/toyota-tacoma-seat-covers-accessories-2005-15-2016-2019-2020-2024",
    "https://www.bartact.com/collections/jeep-wrangler-tj-1997-02-accessories",
    "https://www.bartact.com/collections/jeep-wrangler-tj-lj-2003-06-accessories",
]

credentials = service_account.Credentials.from_service_account_file(SA_PATH, scopes=SCOPES)
session = AuthorizedSession(credentials)

success = 0
fail = 0
quota_hit = False
errors = []

for url in URLS:
    body = json.dumps({"url": url, "type": "URL_UPDATED"})
    try:
        resp = session.post(ENDPOINT, data=body, headers={"Content-Type": "application/json"})
        if resp.status_code == 200:
            success += 1
            print(f"OK  {resp.status_code} {url}")
        elif resp.status_code == 429:
            fail += 1
            quota_hit = True
            print(f"FAIL 429 (quota) {url}")
        else:
            fail += 1
            detail = resp.text[:200]
            errors.append(f"{resp.status_code}: {detail}")
            print(f"FAIL {resp.status_code} {url} — {detail}")
    except Exception as e:
        fail += 1
        errors.append(str(e))
        print(f"ERR  {url} — {e}")
    time.sleep(0.5)

print(f"\n--- RESULTS ---")
print(f"Success: {success}/{len(URLS)}")
print(f"Failed:  {fail}/{len(URLS)}")
if quota_hit:
    print("QUOTA_HIT=YES")
if errors:
    print("Errors:", "; ".join(errors))
