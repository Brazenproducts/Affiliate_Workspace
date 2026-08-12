# Affiliate Site Health Check — August 12, 2026

**Scan Date:** Wednesday, August 12, 2026 - 6:00 AM UTC
**Mode:** Full live HTTPS checks

## Summary

- **Total Sites Scanned:** 738
- **✅ Healthy (OK):** 47 sites
- **⚠️ Warning Issues:** 294 sites
- **🔴 Critical Issues:** 386 sites
- **🔴 Down (live check failed):** 268 sites

## Delta vs Last Live Run (2026-08-09)

- **Previous down count:** 270
- **Today's down count:** 268
- **New sites down:** 0
- **Recovered sites:** 2 (bestlabel-maker.com, shedwithoutpermit.com)
- **Critical threshold (>10 new down):** ❌ NOT triggered

## Root Cause (ongoing)

The bulk of outages remain the GitHub Pages SSL cert mismatch issue first detected 2026-08-02. Custom domain certs presenting GitHub's wildcard cert instead of the domain cert. This is a persistent GitHub Pages infrastructure issue.

## Dashboard

Rebuilt and pushed: https://brazenproducts.github.io/axl-dashboard/
Audit run: 2026-08-12 06:00 UTC
Previous live audit: 2026-08-09
Change: -2 sites (slight improvement, 2 recovered)
