#!/bin/bash
export GH_TOKEN="REDACTED_GH_TOKEN"
cd /home/ubuntu/.openclaw/workspace
python3 scripts/fix-affiliate-homepage.py jeepseatcover.com
python3 scripts/fix-affiliate-homepage.py bestbroncoaccessories.com
