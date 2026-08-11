#!/usr/bin/env python3
"""
build_utils.py — Shared post-build utilities.
Call post_build_submit(domain) at the end of every builder script.
"""
import subprocess, sys
from pathlib import Path

SCRIPTS = Path(__file__).parent

def post_build_submit(domain):
    """Submit all pages for domain to Google Indexing API + IndexNow. Call after every build."""
    print(f"\n📡 Submitting {domain} to search engines...")
    result = subprocess.run(
        [sys.executable, str(SCRIPTS / "submit-urls.py"), domain],
        capture_output=True, text=True
    )
    if result.stdout: print(result.stdout.strip())
    if result.stderr: print(result.stderr.strip())
