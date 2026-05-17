#!/bin/bash
export GH_TOKEN="REDACTED_GH_TOKEN"
cd /home/ubuntu/.openclaw/workspace
python3 scripts/fix-affiliate-bartact-cta.py "$@"
