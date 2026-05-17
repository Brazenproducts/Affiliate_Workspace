# Affiliate Site Sub-Agent Brief

**Read this before spawning ANY sub-agent for affiliate site work.**

## Sub-Agent Task Prompt MUST Include:

1. `Read /home/ubuntu/.openclaw/workspace/reference/affiliate-site-rules.md FIRST.`
2. Explicit affiliate tag: `tag=brazenprodu01-20`
3. Warning: "AI CANNOT invent Amazon image IDs — they WILL 404. Only use verified URLs."
4. Git config: `user.email axl@openclaw.ai, user.name Axl`
5. Repo org: `Brazenproducts`

## After Sub-Agent Completes (MY responsibility, not theirs):

```bash
# 1. Run the QA script
./scripts/affiliate-post-build-qa.sh <domain>

# 2. If failures → fix them myself, re-run until clean

# 3. Wait for GitHub Pages deploy (~1-2 min)
sleep 90

# 4. Screenshot the live site
# Use browser tool to load https://<domain>/ and screenshot

# 5. ONLY THEN tell Mitch it's done
```

## Common Sub-Agent Failures I Must Catch:

| Failure | How to detect | Fix |
|---------|--------------|-----|
| Hallucinated Amazon images | curl -sI returns 404 | Use SP-API to get real images |
| Missing affiliate tag | grep href.*amazon | grep -v brazenprodu01-20 | sed/replace in HTML |
| Dark text on dark hero | Visual inspection / grep | Set color: #fff + text-shadow |
| Duplicate images across cards | sort img srcs, check uniq -d | Replace with unique images |
| Placeholder contact key | grep SET_ME_ACCESS_KEY | Insert real Web3Forms key |
| Missing SEO tags | grep for title/meta/canonical | Add them |

## Real Amazon Images — How to Get Them:

```bash
# Get SP-API token
TOKEN=$(curl -s -X POST https://api.amazon.com/auth/o2/token \
  -d "grant_type=refresh_token&refresh_token=<from .amazon-bartact-credentials.json>&client_id=<id>&client_secret=<secret>" \
  | jq -r .access_token)

# Search for product images
curl -s "https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items?marketplaceIds=ATVPDKIKX0DER&keywords=<product>&includedData=images&pageSize=5" \
  -H "x-amz-access-token: $TOKEN"

# Verify each image URL
curl -sI "https://m.media-amazon.com/images/I/<real-id>._AC_SL1500_.jpg" | head -1
```

## Never Forget:
- Mitch said (5/10): "I shouldn't have to ask you all of these things repeatedly."
- Every failure that reaches Mitch is a trust failure.
- The QA script exists. Use it. Every. Single. Time.
