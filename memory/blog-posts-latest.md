# 📊 Blog Posts — Last 24 Hours

**Run Date:** Friday, August 14th, 2026 - 5:00 AM UTC

## Summary

- **Posts published today:** 117 (from 123 created)
- **Errors:** 6 push failures
- **Sites processed this run:** 125
- **Total runs today:** 1/3

## Details

### ✅ Successful
- Created: 123 posts
- Successfully pushed: 117 posts
- Blocked/skipped: 5 sites (DO_NOT_BUILD list)

### ⚠️ Push Failures (6)
1. `tacticalseats-com` — git origin remote issue
2. `truckbedmats.com` — git remote error
3. `whatsizehvacfilter-com` — git remote error
4. `wholehouseairfilter-com` — git remote error
5. `autopartsreviewed-com` — git remote error
6. `autoshipfilter-com` — "No such remote 'origin'"

### 📋 Blocked Sites (5)
- faithfulpassages.com
- fernallern.com
- hspseats.com
- huntersafetyproducts.com
- thornwoodaccord.com

## Status

🟡 **Partially Healthy** — 93.5% push success rate (117/125).

**Root Cause Identified:** Git push failures are due to:
1. **Invalid/expired GitHub token** in remote URLs (auth failure)
2. **Missing remote config** in autoshipfilter-com repo (no `[remote "origin"]` section)
3. **Repositories not found** on GitHub (may have been deleted or organization access revoked)

**AI Cost:** $0 — templates only ✅

## Troubleshooting
- GitHub token needs refresh/regeneration
- autoshipfilter-com needs remote URL added: `git remote add origin <url>`
- Verify repo URLs are still valid in GitHub
- Check Brazenproducts org access permissions

## Next Steps
- Refresh GitHub authentication token
- Repair git remote configs
- Retry failed sites on next cycle
- Remaining sites in queue: 596
