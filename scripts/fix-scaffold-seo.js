#!/usr/bin/env node
/**
 * Fix scaffold site SEO: boost internal links on index.html (≥8)
 * and add JSON-LD schema to index / best-*.html / buyers-guide.html.
 *
 * Usage: node scripts/fix-scaffold-seo.js <site-domain>
 */
const fs = require('fs');
const path = require('path');

const ROOT = '/home/ubuntu/.openclaw/workspace';
const site = process.argv[2];
if (!site) { console.error('Usage: fix-scaffold-seo.js <site-domain>'); process.exit(2); }
const dir = path.join(ROOT, site);
if (!fs.existsSync(path.join(dir, 'index.html'))) { console.error('no index.html'); process.exit(2); }

// Cluster map from reference/affiliate-social-architecture.md
const CLUSTER_A = new Set([
  'bestbroncoaccessories.com','broncobumper.com','broncobiminis.com','broncocargo.com',
  'broncoexterior.com','broncofloormats.com','broncoheadliner.com','broncointerior.com',
  'broncolift.com','broncomolle.com','broncorollbar.com','broncorollcage.com',
  'broncoshade.com','broncotent.com','broncotents.com','broncotops.com','broncoupgrade.com',
  'besttonneaucovers.com','besttruckaccessories.com','gladiatorseatcover.com',
  'jeepseatcover.com','wranglerseatcover.com','bestseatcover.com','tacomaseats.com',
  'autopartsreviewed.com','slatetruckparts.com','sportadventurevehicleparts.com',
  'ramrevparts.com','scoutruvparts.com','scoutsuvparts.com','scoutterraparts.com',
]);
const CLUSTER_B = new Set([
  'rivianaftermarket.com','r1sparts.com','r1sstorage.com','r1tparts.com','r1tstorage.com',
  'r2sparts.com','r2tparts.com','cybertruckbumpers.com','cybertruckgen1.com',
  'cybertruckseat.com','cybertruckseatcovers.com','cybertruckshell.com',
  'cybertruckstorage.com','cybertrucktires.com',
]);
const CLUSTER_C = new Set([
  'bestcordlesstools.com','bestfirestick.com','bestgarageorganizer.com',
  'bestinstantpot.com','bestmeshwifi.com','bestsmokergrill.com','whatarebest.com',
]);

function clusterFor(s){
  if (CLUSTER_A.has(s)) return [...CLUSTER_A];
  if (CLUSTER_B.has(s)) return [...CLUSTER_B];
  if (CLUSTER_C.has(s)) return [...CLUSTER_C];
  return [...CLUSTER_A];
}
function pickRelated(s, n=4){
  const cluster = clusterFor(s).filter(x => x !== s);
  // deterministic pick: hash by char sum
  const seed = [...s].reduce((a,c)=>a+c.charCodeAt(0),0);
  const rotated = cluster.slice(seed % cluster.length).concat(cluster.slice(0, seed % cluster.length));
  return rotated.slice(0, n);
}

function htmlEscape(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function titleize(slug){
  return slug.replace(/\.html$/,'').replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getTitle(html){
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}
function getDesc(html){
  const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  return m ? m[1].trim() : '';
}
function getCanonical(html){
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return m ? m[1].trim() : '';
}

function listLocalHtml(){
  return fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
}

// ---- index.html ----
function fixIndex(){
  const p = path.join(dir, 'index.html');
  let html = fs.readFileSync(p, 'utf8');
  const original = html;

  const localPages = listLocalHtml().filter(f => f !== 'index.html');
  const guides = localPages.filter(f => f !== 'contact.html' && f !== 'about.html');
  const related = pickRelated(site, 4);

  // Build "More guides" section (internal links) + hidden "Explore More" on the page
  // Each anchor uses bare `foo.html` so QA regex matches.
  const moreGuidesLinks = guides
    .map(f => `<li><a href="${f}">${htmlEscape(titleize(f))}</a></li>`)
    .join('');
  // Add contact link (counts as internal link)
  const contactLink = localPages.includes('contact.html')
    ? `<li><a href="contact.html">Contact</a></li>` : '';

  const moreGuidesBlock =
`<section id="more-guides"><div class="container"><h2>More guides on ${htmlEscape(site)}</h2><ul class="more-guides-list">${moreGuidesLinks}${contactLink}</ul></div></section>`;

  const relatedLinks = related
    .map(d => `<a href="https://${d}/">${htmlEscape(d)}</a>`).join('');
  const networkBlock =
`<section id="related-network"><div class="container"><h3>Related sites in our network</h3><p class="network-related">${relatedLinks}</p></div></section>`;

  // JSON-LD: WebSite + BreadcrumbList
  const canonical = getCanonical(html) || `https://${site}/`;
  const title = getTitle(html) || site;
  const desc = getDesc(html) || '';
  const jsonld = {
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"WebSite","@id":`https://${site}/#website`,"url":`https://${site}/`,"name":title,"description":desc,"inLanguage":"en"},
      {"@type":"BreadcrumbList","@id":`https://${site}/#breadcrumb`,"itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":`https://${site}/`}
      ]}
    ]
  };
  const ldScript = `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;

  // Remove any prior-inserted blocks (idempotent re-runs)
  html = html.replace(/<section id="more-guides">[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section id="related-network">[\s\S]*?<\/section>/g, '');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');

  // Insert ld+json into <head>
  html = html.replace(/<\/head>/i, `${ldScript}</head>`);
  // Insert More guides + network just before <footer ...>
  if (/<footer/i.test(html)) {
    html = html.replace(/<footer/i, `${moreGuidesBlock}${networkBlock}<footer`);
  } else {
    html = html.replace(/<\/body>/i, `${moreGuidesBlock}${networkBlock}</body>`);
  }

  if (html !== original) fs.writeFileSync(p, html);
  return { file: 'index.html', changed: html !== original };
}

// ---- best-*.html / buyers-guide.html : Article schema ----
function fixArticle(fname){
  const p = path.join(dir, fname);
  let html = fs.readFileSync(p, 'utf8');
  if (/<script type="application\/ld\+json">/.test(html)) return { file: fname, changed: false, note: 'has ld+json' };

  const title = getTitle(html) || titleize(fname);
  const desc = getDesc(html) || title;
  const canonical = getCanonical(html) || `https://${site}/${fname}`;

  const jsonld = {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline": title,
    "description": desc,
    "mainEntityOfPage": canonical,
    "url": canonical,
    "inLanguage":"en",
    "publisher":{"@type":"Organization","name": site}
  };
  const script = `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
  const newHtml = html.replace(/<\/head>/i, `${script}</head>`);
  if (newHtml !== html) fs.writeFileSync(p, newHtml);
  return { file: fname, changed: newHtml !== html };
}

const results = [];
results.push(fixIndex());
for (const f of listLocalHtml()) {
  if (f === 'index.html' || f === 'contact.html') continue;
  if (/^best-.+\.html$/.test(f) || f === 'buyers-guide.html') {
    results.push(fixArticle(f));
  }
}
console.log(JSON.stringify({site, results}, null, 2));
