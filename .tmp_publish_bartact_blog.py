from pathlib import Path
import json
import re
from urllib import request

env_lines = Path('/home/ubuntu/.openclaw/workspace/.env').read_text().splitlines()
token = next((line.split('=', 1)[1].strip() for line in env_lines if line.startswith('SHOPIFY_TOKEN_BARTACT=')), None)
if not token:
    raise SystemExit('SHOPIFY_TOKEN_BARTACT not found')

handle = 'limit-straps-jeep-wrangler-utv-guide'
title = 'Limit Straps for Jeep Wrangler and UTV Builds: What They Do and Why You Need Them'
body_html = Path('/tmp/bartact_article.html').read_text()

payload = json.dumps({
    'article': {
        'title': title,
        'handle': handle,
        'body_html': body_html,
        'published': True,
    }
}).encode()
req = request.Request(
    'https://bartact.myshopify.com/admin/api/2024-01/blogs/19510597/articles.json',
    data=payload,
    headers={
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
    },
    method='POST',
)
with request.urlopen(req, timeout=60) as resp:
    shopify = json.loads(resp.read().decode())

article = shopify['article']
url = f'https://www.bartact.com/blogs/news/{handle}'

index_payload = json.dumps({
    'host': 'www.bartact.com',
    'key': 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5',
    'urlList': [url],
}).encode()
index_req = request.Request(
    'https://api.indexnow.org/indexnow',
    data=index_payload,
    headers={'Content-Type': 'application/json'},
    method='POST',
)
with request.urlopen(index_req, timeout=60) as resp:
    index_status = resp.status

plain = re.sub(r'<[^>]+>', ' ', body_html)
plain = re.sub(r'\s+', ' ', plain).strip()
wc = len(plain.split())
mentions = len(re.findall(r'\bBartact\b', plain))
links = len(re.findall(r'href="/collections/', body_html))

state_path = Path('/home/ubuntu/.openclaw/workspace/memory/bartact-blog-daily-state.json')
state = json.loads(state_path.read_text())
state['lastIndex'] = 6
state.setdefault('published', []).append({
    'date': '2026-08-10',
    'title': title,
    'handle': handle,
    'id': article['id'],
})
state_path.write_text(json.dumps(state, indent=2) + '\n')

print(json.dumps({
    'title': title,
    'handle': handle,
    'id': article['id'],
    'url': url,
    'word_count': wc,
    'bartact_mentions': mentions,
    'collection_links': links,
    'indexnow_status': index_status,
}, indent=2))
