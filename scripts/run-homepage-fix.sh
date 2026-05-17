#!/bin/bash
export GH_TOKEN="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"
cd /home/ubuntu/.openclaw/workspace
python3 scripts/fix-affiliate-homepage.py jeepseatcover.com
python3 scripts/fix-affiliate-homepage.py bestbroncoaccessories.com
