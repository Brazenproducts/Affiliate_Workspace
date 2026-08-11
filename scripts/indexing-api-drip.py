#!/usr/bin/env python3
"""
Google Indexing API drip — 199 URLs per domain per day
Each domain is a separate GSC property, so quota is per-domain.
726 domains × 199 = ~144k URLs/day possible.
"""
import json, time, sys
from pathlib import Path
from collections import defaultdict
from google.oauth2 import service_account
import google.auth.transport.requests
import urllib.request

WORKSPACE = Path("/home/ubuntu/.openclaw/workspace")
CREDS_FILE = WORKSPACE / ".gcp-service-account.json"
QUEUE_FILE = WORKSPACE / "indexing-queue.txt"
PROGRESS_FILE = WORKSPACE / "indexing-progress.json"
PER_DOMAIN_LIMIT = 199

def get_token():
    creds = service_account.Credentials.from_service_account_file(
        str(CREDS_FILE),
        scopes=["https://www.googleapis.com/auth/indexing"]
    )
    req = google.auth.transport.requests.Request()
    creds.refresh(req)
    return creds.token

def submit_url(token, url):
    payload = json.dumps({"url": url, "type": "URL_UPDATED"}).encode()
    request = urllib.request.Request(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        urllib.request.urlopen(request, timeout=10)
        return "ok"
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "Permission denied" in body or "not verified" in body.lower() or "does not have access" in body.lower():
            return "skip"
        if "Quota" in body or "quota" in body:
            return "quota"
        return "fail"
    except Exception:
        return "fail"

def main():
    if not QUEUE_FILE.exists():
        print("No queue file.")
        sys.exit(0)

    progress = {}
    if PROGRESS_FILE.exists():
        progress = json.loads(PROGRESS_FILE.read_text())

    submitted_set = set(progress.get("submitted", []))
    skipped_set = set(progress.get("skipped", []))

    all_urls = [u.strip() for u in QUEUE_FILE.read_text().splitlines() if u.strip()]
    pending = [u for u in all_urls if u not in submitted_set and u not in skipped_set]

    if not pending:
        print("Queue complete — all URLs submitted.")
        sys.exit(0)

    # Group pending by domain
    by_domain = defaultdict(list)
    for url in pending:
        domain = url.split("/")[2]
        by_domain[domain].append(url)

    print(f"Queue: {len(all_urls)} total | {len(submitted_set)} done | {len(skipped_set)} skipped | {len(pending)} pending across {len(by_domain)} domains")

    token = get_token()
    token_count = 0
    submitted, skipped, failed, quota_hit = [], [], [], []
    total_ok = 0

    for domain, urls in sorted(by_domain.items()):
        batch = urls[:PER_DOMAIN_LIMIT]
        domain_ok = 0
        for url in batch:
            result = submit_url(token, url)
            token_count += 1
            if result == "ok":
                submitted.append(url)
                domain_ok += 1
                total_ok += 1
            elif result == "skip":
                skipped.append(url)
            elif result == "quota":
                quota_hit.append(url)
                break  # quota hit for this domain, move on
            else:
                failed.append(url)
            # Refresh token every 100 calls
            if token_count % 100 == 0:
                token = get_token()
            time.sleep(0.1)

    # Save progress
    all_submitted = list(submitted_set) + submitted
    all_skipped = list(skipped_set) + skipped
    progress["submitted"] = all_submitted
    progress["skipped"] = all_skipped
    progress["last_run"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    progress["total_submitted"] = len(all_submitted)
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

    remaining = len(all_urls) - len(all_submitted) - len(all_skipped)
    print(f"\nDone: {total_ok} submitted | {len(skipped)} skipped (not in GSC) | {len(failed)} failed | {len(quota_hit)} quota-hit")
    print(f"Progress: {len(all_submitted)}/{len(all_urls)} | {remaining} remaining")

if __name__ == "__main__":
    main()
