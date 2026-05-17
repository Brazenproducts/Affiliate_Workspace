const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

// All affected product IDs
const ids = [
  7394524692523, // Gladiator bolt-on
  7177738387499, // JL/JLU bolt-on
  1287344773,    // Universal pair of 2
  3948249481239, // Universal set of 4
];

async function main() {
  for (const id of ids) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json?fields=id,title,body_html', { headers });
    const d = await r.json();
    let body = d.product.body_html;

    // Fix all variations to just "Sky One-Touch Top"
    body = body
      .replace(/Sky One-Touch Top<\/strong>, and <strong>One Touch Electric Top<\/strong>/g, 'Sky One-Touch Top</strong>')
      .replace(/Sky One-Touch Top and One Touch Electric Top/g, 'Sky One-Touch Top')
      .replace(/<strong>One Touch Electric Top<\/strong>/g, '<strong>Sky One-Touch Top</strong>')
      .replace(/One Touch electric top/gi, 'Sky One-Touch Top')
      .replace(/One Touch Electric Top/g, 'Sky One-Touch Top')
      .replace(/Sky One-Touch \/ power top roof/g, 'Sky One-Touch Top')
      .replace(/Sky One-Touch Top or Automatic Power Top Roof/g, 'Sky One-Touch Top');

    if (body === d.product.body_html) {
      console.log('⏭️  No changes needed:', d.product.title);
      continue;
    }

    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id, body_html: body } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
