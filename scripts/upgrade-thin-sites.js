const fs = require('fs');
const path = require('path');

const heroBySite = {
  'broncobiminis.com': 'https://bartact.com/cdn/shop/files/Bronco_Bimini_Top.jpg?v=1731954374&width=1600',
  'broncobumper.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'broncocargo.com': 'https://bartact.com/cdn/shop/files/Bronco_door_bag_1.jpg?v=1731954374&width=1600',
  'broncoexterior.com': 'https://bartact.com/cdn/shop/files/Bronco_door_bag_1.jpg?v=1731954374&width=1600',
  'broncoheadliner.com': 'https://m.media-amazon.com/images/I/61bMNCeAUAL._AC_SL1500_.jpg',
  'broncointerior.com': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-ford-bronco-seat-covers-black-blue-same-as-insert-color-bartact-tactical-front-seat-covers-for-ford-bronco-2021-2022-4-door-only-29018880802859.jpg?v=1762459918',
  'broncomolle.com': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-molle-accessories-molle-pouch-7-x-7-x-2-5-lightweight-pals-molle-gear-compatible-29023047811115.jpg?v=1762457100',
  'broncorollbar.com': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-jeep-grab-handles-for-roll-bar-pair-of-2-paracord-grab-handles-for-jeep-wrangler-gladiator-polaris-rzr-canam-maverick-x3-29023031230507.jpg?v=1762457074',
  'broncorollcage.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'broncoshade.com': 'https://bartact.com/cdn/shop/files/Bronco_Bimini_Top.jpg?v=1731954374&width=1600',
  'broncotent.com': 'https://m.media-amazon.com/images/I/61bMNCeAUAL._AC_SL1500_.jpg',
  'broncotents.com': 'https://m.media-amazon.com/images/I/61bMNCeAUAL._AC_SL1500_.jpg',
  'broncotops.com': 'https://bartact.com/cdn/shop/files/Bronco_Bimini_Top.jpg?v=1731954374&width=1600',
  'broncoupgrade.com': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-ford-bronco-seat-covers-black-blue-same-as-insert-color-bartact-tactical-front-seat-covers-for-ford-bronco-2021-2022-4-door-only-29018880802859.jpg?v=1762459918',
  'cybertruckgen1.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'cybertruckseat.com': 'https://m.media-amazon.com/images/I/61bMNCeAUAL._AC_SL1500_.jpg',
  'cybertruckshell.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'cybertrucktires.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'r1sstorage.com': 'https://m.media-amazon.com/images/I/61bMNCeAUAL._AC_SL1500_.jpg',
  'r1tstorage.com': 'https://m.media-amazon.com/images/I/61bMNCeAUAL._AC_SL1500_.jpg',
  'r2sparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'r2tparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'ramrevparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'scoutruvparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'scoutsuvparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'scoutterraparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'slatetruckparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg',
  'sportadventurevehicleparts.com': 'https://m.media-amazon.com/images/I/61mpK93Qg0L._AC_SL1500_.jpg'
};

for (const [site, hero] of Object.entries(heroBySite)) {
  const dir = path.join('/home/ubuntu/.openclaw/workspace', site);
  const htmlPath = path.join(dir, 'index.html');
  const cssPath = path.join(dir, 'style.css');
  if (!fs.existsSync(htmlPath) || !fs.existsSync(cssPath)) continue;

  let html = fs.readFileSync(htmlPath, 'utf8');
  let css = fs.readFileSync(cssPath, 'utf8');

  css = css.replace(/\.hero\{padding:68px 0 34px;background:[^}]+\}/, `.hero{padding:82px 0 46px;background:linear-gradient(rgba(10,14,18,.56),rgba(10,14,18,.56)),url('${hero}') center/cover no-repeat}`);
  if (!css.includes('.card img{width:100%')) {
    css += '\n.card img{width:100%;height:180px;object-fit:cover;border-radius:10px;margin:0 0 14px;display:block;box-shadow:0 10px 26px rgba(0,0,0,.18)}\n';
  }

  html = html.replace(/First-pass launch version:[^<]+/g, 'Focused buying guides with cleaner picks, stronger visuals, and links that actually work. No fake testing claims. No made-up specs.');
  html = html.replace(/(<div class="card"><h3>)/g, `<div class="card"><img alt="${site.replace('.com','')} product category" loading="lazy" src="${hero}"/><h3>`);
  html = html.replace('<section><div class="container"><h2>Quick notes</h2>', '<section><div class="container"><h2>What actually matters before you buy</h2><p style="max-width:760px;color:var(--muted);margin:0 0 18px">This first serious pass adds real visuals and a more credible buyer-first frame while deeper comparison pages get built behind it.</p>');

  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(cssPath, css);
  console.log(`updated ${site}`);
}
