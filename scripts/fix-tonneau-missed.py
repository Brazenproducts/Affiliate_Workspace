#!/usr/bin/env python3
"""Quick-fix for besttonneaucovers about.html and buyers-guide.html"""
import os

SITE = '/home/ubuntu/.openclaw/workspace/projects/besttonneaucovers-site'
LOGO = 'BEST<span>TONNEAU</span>COVERS'
HERO_BG = '#1a2a3a'
SITE_NAME = 'BestTonneauCovers.com'

NAV = [
    ('Home','index.html'),('Best Overall','best-tonneau-covers-2026.html'),
    ('Hard Fold','best-hard-fold-tonneau-covers.html'),('Soft Roll-Up','best-soft-roll-up-tonneau-covers.html'),
    ('Retractable','best-retractable-tonneau-covers.html'),('Budget','best-budget-tonneau-covers.html'),
    ("Buyer's Guide",'buyers-guide.html'),('About','about.html'),
]

nav_html = ''.join(f'<li><a href="{h[1]}">{h[0]}</a></li>' for h in NAV)

pages = [
    ('about.html',
     'About BestTonneauCovers.com', 'About BestTonneauCovers.com',
     'About BestTonneauCovers.com, an independent tonneau cover review site.',
     'https://besttonneaucovers.com/about.html',
     '<p>BestTonneauCovers.com exists because most tonneau cover content online is bloated, generic, and weirdly afraid to tell buyers when they are overpaying. We prefer straightforward recommendations based on category fit, price, and real owner value.</p><p>We cover hard-fold, retractable, soft roll-up, and budget covers. The goal is simple: help truck owners buy the right cover once instead of learning everything the expensive way.</p><p>Contact: <a href="mailto:info@brazenauto.com">info@brazenauto.com</a></p>'),
    ('buyers-guide.html',
     "Tonneau Cover Buyer's Guide", "How to Buy a Tonneau Cover Without Regretting It",
     'How to choose a tonneau cover: hard fold vs soft roll-up vs retractable, plus what matters most for security and weather protection.',
     'https://besttonneaucovers.com/buyers-guide.html',
     '<p>Tonneau covers look simple until you start comparing them. Then suddenly you are choosing between hard fold, soft roll-up, retractable, tri-fold, and whether your truck bed is about to become an engineering project.</p><h2>Hard Fold</h2><p>Usually the best all-around category for people who want better security, a premium look, and practical bed access.</p><h2>Soft Roll-Up</h2><p>The value category. Great for weather protection and ease of use, but weaker on security.</p><h2>Retractable</h2><p>The premium convenience category. Great when you really want it, easy to overpay for when you do not.</p><h2>What Actually Matters</h2><p>Look at weather sealing, hardware quality, drain management, bed access, and whether the product has a strong reputation for your truck model.</p>'),
]

for fname, full_title, h1_text, description, canonical, body in pages:
    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{full_title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<meta property="og:type" content="article">
<meta property="og:title" content="{full_title}">
<meta property="og:url" content="{canonical}">
<meta property="og:description" content="{description}">
<meta property="og:site_name" content="{SITE_NAME}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Article","headline":"{h1_text}","description":"{description}","publisher":{{"@type":"Organization","name":"What Are Best"}}}}</script>
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo">{LOGO}</a>
    <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>
    <nav class="main-nav" role="navigation"><ul>{nav_html}</ul></nav>
  </div>
</header>
<section class="hero" style="background:linear-gradient(135deg,var(--charcoal) 0%,{HERO_BG} 50%,var(--charcoal-light) 100%)">
  <h1>{h1_text}</h1>
</section>
<div class="container">
  <div class="content-grid">
    <main class="article-content">
{body}
    </main>
    <aside class="sidebar">
      <div class="widget">
        <h4>Looking for Help?</h4>
        <p style="font-size:.9rem;color:var(--text-secondary)">Check our Buyer's Guide for step-by-step advice on picking the right tonneau cover.</p>
        <a href="buyers-guide.html" style="color:var(--accent-light);font-weight:600;font-size:.9rem">See the Buyer's Guide</a>
      </div>
      <div class="widget">
        <h4>More Guides</h4>
        <ul>
          <li><a href="best-tonneau-covers-2026.html">Best Overall</a></li>
          <li><a href="best-hard-fold-tonneau-covers.html">Hard Fold Covers</a></li>
          <li><a href="buyers-guide.html">Buyer's Guide</a></li>
        </ul>
      </div>
    </aside>
  </div>
</div>
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-col"><h4>{LOGO}</h4><p>Independent reviews for real truck owners.</p></div>
    <div class="footer-col"><h4>Main Guides</h4><ul><li><a href="best-tonneau-covers-2026.html">Best Overall</a></li><li><a href="buyers-guide.html">Buyer's Guide</a></li><li><a href="about.html">About</a></li></ul></div>
    <div class="footer-col"><h4>Network</h4><p>Part of the <a href="https://www.whatarebest.com" target="_blank" rel="noopener">What Are Best</a> review network.</p></div>
  </div>
  <div class="affiliate-disclosure"><p><strong>Affiliate Disclosure:</strong> This site participates in the Amazon Associates Program and may earn commissions from qualifying purchases.</p></div>
  <div class="footer-bottom"><p>&copy; 2026 {SITE_NAME} — All rights reserved.</p></div>
</footer>
<div class="network-links"><strong>What Are Best Review Network:</strong> <a href="https://whatarebest.com">What Are Best</a> · <a href="https://bestseatcover.com">Best Seat Covers</a> · <a href="https://jeepseatcover.com">Jeep Seat Covers</a> · <a href="https://bestbroncoaccessories.com">Bronco Accessories</a> · <a href="https://besttruckaccessories.com">Truck Accessories</a> · <a href="https://besttonneaucovers.com">Tonneau Covers</a> · <a href="https://petwearhouse.com">Pet Wearhouse</a> · <a href="https://bestfirestick.com">Best Firestick</a> · <a href="https://bestcordlesstools.com">Cordless Tools</a> · <a href="https://limitstraps.com">Limit Straps</a></div>
<script src="js/main.js"></script>
</body>
</html>'''
    with open(os.path.join(SITE, fname), 'w') as f:
        f.write(content)
    print(f'Written: {fname}')
