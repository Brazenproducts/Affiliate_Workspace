#!/usr/bin/env python3
"""Deploy all 8 sites — use domain.com as repo name, user repos not org."""
import json, subprocess, time, urllib.request, urllib.error

GH_TOKEN = "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"
GH_USER = "Brazenproducts"
WORK = "/home/ubuntu/.openclaw/workspace/sites"

DOMAINS = [
    "autopartsreviewed.com","topoffroadstores.com","bestoffroadbrands.com",
    "tacticalseats.com","homehvacfilters.com","bestwindshieldwiper.com",
    "tacticalseatcovers.com","tacomaseats.com"
]

def gh(method, path, data=None):
    url = f"https://api.github.com{path}"
    h = {"Authorization":f"token {GH_TOKEN}","Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
    body = json.dumps(data).encode() if data else None
    if body: h["Content-Type"]="application/json"
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        r = urllib.request.urlopen(req)
        return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]

for d in DOMAINS:
    repo = d  # use domain.com as repo name
    # Source dir used dashes
    src_dir = f"{WORK}/{d.replace('.','-')}"
    print(f"\n=== {d} ===")
    
    # Check if repo exists
    s, _ = gh("GET", f"/repos/{GH_USER}/{repo}")
    if s == 404:
        print("  Creating repo...")
        s, r = gh("POST", "/user/repos", {"name":repo,"public":True,"auto_init":False})
        print(f"  create: {s}")
        time.sleep(1)
    else:
        print(f"  Repo exists ({s})")
    
    # Update CNAME in source to match
    # Git push - use the domain.com repo name
    cmds = f"""cd {src_dir} && \
rm -rf .git && \
git init -b main && \
git config user.email 'deploy@{d}' && \
git config user.name Deploy && \
git add -A && \
git commit -m 'Deploy {d}' && \
git remote add origin https://x-access-token:{GH_TOKEN}@github.com/{GH_USER}/{repo}.git && \
git push -u origin main --force 2>&1 | tail -3"""
    r = subprocess.run(cmds, shell=True, capture_output=True, text=True, timeout=60)
    if r.returncode == 0:
        print(f"  push: OK")
    else:
        print(f"  push: FAIL")
        print(f"  stdout: {r.stdout[-200:]}")
        print(f"  stderr: {r.stderr[-200:]}")
    
    # Enable Pages
    s, r = gh("POST", f"/repos/{GH_USER}/{repo}/pages", {"source":{"branch":"main","path":"/"}})
    print(f"  pages: {s}")
    if s == 409:
        print("  Pages already enabled")
    
    # Set CNAME
    time.sleep(1)
    s, r = gh("PUT", f"/repos/{GH_USER}/{repo}/pages", {"cname":d,"source":{"branch":"main","path":"/"}})
    print(f"  cname: {s}")

print("\n=== ALL DONE ===")
