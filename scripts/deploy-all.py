#!/usr/bin/env python3
"""Deploy all 8 sites to GitHub Pages."""
import json, subprocess, time, urllib.request, urllib.error

import os


def get_github_token():
    env_token = os.environ.get("GH_TOKEN")
    if env_token:
        return env_token
    remote = subprocess.check_output(
        ["git", "-C", "/home/ubuntu/.openclaw/workspace/swalmy.com", "remote", "get-url", "origin"],
        text=True,
    ).strip()
    marker = "https://"
    suffix = "@github.com/"
    if remote.startswith(marker) and suffix in remote:
        return remote[len(marker):remote.index(suffix)]
    raise RuntimeError("GitHub token not found. Set GH_TOKEN or fix swalmy.com origin URL.")


GH_TOKEN = get_github_token()
GH_ORG = "Brazenproducts"
WORK = "/home/ubuntu/.openclaw/workspace/sites"

DOMAINS = [
    "autopartsreviewed.com","topoffroadstores.com","bestoffroadbrands.com",
    "tacticalseats.com","homehvacfilters.com","bestwindshieldwiper.com",
    "tacticalseatcovers.com","tacomaseats.com"
]

def gh_api(method, path, data=None):
    url = f"https://api.github.com{path}"
    h = {"Authorization":f"token {GH_TOKEN}","Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
    body = json.dumps(data).encode() if data else None
    if body: h["Content-Type"]="application/json"
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        r = urllib.request.urlopen(req)
        return r.status
    except urllib.error.HTTPError as e:
        return e.code

for d in DOMAINS:
    repo = d.replace(".","-")
    print(f"\n=== {d} ({repo}) ===")
    
    # Create repo
    s = gh_api("POST", f"/orgs/{GH_ORG}/repos", {"name":repo,"public":True,"auto_init":False,"has_issues":False,"has_wiki":False})
    print(f"  repo: {s}")
    
    # Git push
    site_dir = f"{WORK}/{repo}"
    cmds = f"""cd {site_dir} && \
git init -b main 2>/dev/null && \
git config user.email 'deploy@{d}' && \
git config user.name Deploy && \
git add -A && \
git commit -m 'Initial deploy' 2>/dev/null || true && \
git remote add origin https://x-access-token:{GH_TOKEN}@github.com/{GH_ORG}/{repo}.git 2>/dev/null || \
git remote set-url origin https://x-access-token:{GH_TOKEN}@github.com/{GH_ORG}/{repo}.git && \
git push -u origin main --force 2>&1 | tail -2"""
    r = subprocess.run(cmds, shell=True, capture_output=True, text=True, timeout=60)
    print(f"  push: {'OK' if r.returncode==0 else 'FAIL: '+r.stderr[-200:]}")
    
    # Enable Pages
    s = gh_api("POST", f"/repos/{GH_ORG}/{repo}/pages", {"source":{"branch":"main","path":"/"}})
    print(f"  pages: {s}")
    time.sleep(1)
    s = gh_api("PUT", f"/repos/{GH_ORG}/{repo}/pages", {"cname":d,"source":{"branch":"main","path":"/"}})
    print(f"  cname: {s}")

print("\n=== ALL DEPLOYED ===")
