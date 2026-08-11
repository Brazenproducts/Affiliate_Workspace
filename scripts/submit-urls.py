#!/usr/bin/env python3
"""
submit-urls.py — Submit URLs to both Google Indexing API and IndexNow after every push.
Usage: python3 submit-urls.py domain.com [url1 url2 ...]
If no URLs given, submits all HTML pages found in sites/domain.com/
"""
import json, sys, time, urllib.request
from pathlib import Path
from google.oauth2 import service_account
import google.auth.transport.requests

WORKSPACE = Path("/home/ubuntu/.openclaw/workspace")
CREDS_FILE = WORKSPACE / ".gcp-service-account.json"
INDEXNOW_KEY = "b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
SKIP = {"sitemap.xml","googlec55128789f00e1a7.html","contact.html","about.html",
        "thanks.html","privacy.html","terms.html",
        f"{INDEXNOW_KEY}.txt","e9c8f5a4b3d2c1a0f9e8d7c6b5a4e9c8.txt"}

def get_token():
    creds = service_account.Credentials.from_service_account_file(
        str(CREDS_FILE), scopes=["https://www.googleapis.com/auth/indexing"])
    req = google.auth.transport.requests.Request()
    creds.refresh(req)
    return creds.token

def google_submit(token, url):
    payload = json.dumps({"url": url, "type": "URL_UPDATED"}).encode()
    req = urllib.request.Request(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST")
    try:
        urllib.request.urlopen(req, timeout=10)
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "Quota" in body or "quota" in body:
            return "quota"
        return False
    except:
        return False

def indexnow_submit(domain, urls):
    payload = json.dumps({
        "host": domain,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{domain}/{INDEXNOW_KEY}.txt",
        "urlList": urls[:10000]
    }).encode()
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST")
    try:
        urllib.request.urlopen(req, timeout=10)
        return True
    except:
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 submit-urls.py domain.com [url1 url2 ...]")
        sys.exit(1)

    domain = sys.argv[1]
    if len(sys.argv) > 2:
        urls = sys.argv[2:]
    else:
        site_dir = WORKSPACE / "sites" / domain
        if not site_dir.exists():
            print(f"No site dir found for {domain}")
            sys.exit(1)
        urls = []
        for f in sorted(site_dir.glob("*.html")):
            if f.name in SKIP: continue
            slug = "" if f.name == "index.html" else f.name
            urls.append(f"https://{domain}/{slug}")

    if not urls:
        print(f"No URLs found for {domain}")
        sys.exit(0)

    print(f"Submitting {len(urls)} URLs for {domain}...")

    # 1. IndexNow (batch — one call)
    ok = indexnow_submit(domain, urls)
    print(f"  IndexNow: {'✅' if ok else '❌'} ({len(urls)} URLs)")

    # 2. Google Indexing API (per-URL, max 199)
    token = get_token()
    g_ok = g_quota = g_fail = 0
    for i, url in enumerate(urls[:199]):
        result = google_submit(token, url)
        if result is True: g_ok += 1
        elif result == "quota": g_quota += 1; break
        else: g_fail += 1
        if (i+1) % 100 == 0: token = get_token()
        time.sleep(0.1)

    print(f"  Google:   ✅ {g_ok} submitted | ❌ {g_fail} failed | ⏸ {g_quota} quota-hit")
    if len(urls) > 199:
        print(f"  Note: {len(urls)-199} URLs beyond quota — will be picked up by daily drip cron")

if __name__ == "__main__":
    main()
