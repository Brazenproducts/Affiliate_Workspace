# 🚨 CRITICAL: brazenauto Google Indexing API Token Expired

**Time:** Wednesday, August 5, 2026 - 12:00 PM UTC  
**Status:** DEAD (CONFIRMED)  
**Impact:** 1,600+ affiliate URLs will STOP being submitted to Google Search Console

## Token Refresh Attempt
- **Request:** POST to https://oauth2.googleapis.com/token
- **Error:** `invalid_grant` — "Bad Request"
- **Client ID:** 351767043397-mkr950se4f5ot5km83h5eho9q0agvvlk.apps.googleusercontent.com
- **Credentials Location:** `/home/ubuntu/.openclaw/workspace/.gmail-brazenauto-credentials.json`
- **Last Updated:** 2026-05-08T17:12:44.049Z (STALE — 3 months old)

## Action Required
Mitch must reauthorize immediately:

1. Open this auth URL while logged into **brazenauto@gmail.com**:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Findexing&prompt=consent&response_type=code&client_id=351767043397-mkr950se4f5ot5km83h5eho9q0agvvlk.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A9876%2Fcallback
   ```

2. After consent, Google will redirect to: `http://localhost:9876/callback?code=...`

3. Copy the full redirect URL and send it back to activate new tokens.

**Do NOT delay.** Every day the token is down, affiliate sites lose indexing submissions.

---

## Timeline
- **July 29, 2026 12:00 PM:** Token first detected as dead
- **August 5, 2026 12:00 PM:** Weekly check confirms still dead — token is unrecoverable
