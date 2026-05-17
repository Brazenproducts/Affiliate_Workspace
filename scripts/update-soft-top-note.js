const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

async function main() {
  const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/7177738387499.json?fields=body_html', { headers });
  const d = await r.json();
  const oldWarning = `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>

  <div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
    <p style='margin:0 0 6px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ Compatibility Note:</p>
    <p style='margin:0;font-size:1em;color:#ffffff;'>Does <strong>NOT</strong> work with the manual Soft Top. Hard top or One Touch electric top only.</p>
  </div>`;

  const newWarning = `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
    <p style='margin:0 0 6px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ Compatibility Note:</p>
    <p style='margin:0 0 6px 0;font-size:1em;color:#ffffff;'>Compatible with <strong>Hard Top</strong> and <strong>One Touch Electric Top</strong> only.</p>
    <p style='margin:0;font-size:0.9em;color:#aaaaaa;'>Manual Soft Top version coming soon &mdash; check back or <a href="/pages/contact" style="color:#b8001f;">contact us</a> to be notified.</p>
  </div>`;

  // Just do a targeted string replacement on the warning section
  let body = d.product.body_html;
  body = body.replace(
    /(<div style='background:#1a1a1a;border-left:4px solid #b8001f[^>]*>)\s*<p[^>]*>⚠️ Compatibility Note:<\/p>\s*<p[^>]*>Does <strong>NOT<\/strong> work with the manual Soft Top\.[^<]*<\/p>\s*<\/div>/,
    `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
    <p style='margin:0 0 6px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ Compatibility Note:</p>
    <p style='margin:0 0 6px 0;font-size:1em;color:#ffffff;'>Compatible with <strong>Hard Top</strong> and <strong>One Touch Electric Top</strong> only.</p>
    <p style='margin:0;font-size:0.9em;color:#aaaaaa;'>Manual Soft Top version coming soon &mdash; check back or <a href="/pages/contact" style="color:#b8001f;">contact us</a> to be notified.</p>
  </div>`
  );

  const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/7177738387499.json', {
    method: 'PUT', headers, body: JSON.stringify({ product: { id: 7177738387499, body_html: body } })
  });
  const pd = await put.json();
  console.log(pd.product ? '✅ ' + pd.product.title : '❌ FAILED', pd.errors || '');
}
main().catch(console.error);
