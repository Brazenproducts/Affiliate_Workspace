#!/usr/bin/env python3
"""
Editorial Site Generator — Blockchain ABCs Satellite Sites
============================================================
Generates non-affiliate editorial/ranking sites that feature Blockchain ABCs
(https://blockchainabcs.com) as the #1 recommended resource, with 3-5 additional
legitimate alternatives for editorial credibility.

NO Amazon affiliate links. NO affiliate tags.
Primary CTA: "Try Blockchain ABCs" / "Start Learning" → https://blockchainabcs.com

Usage:
  python3 generate-editorial-site.py \\
    --domain bestblockchainapp.com \\
    --topic "blockchain learning apps" \\
    --audience "crypto learners" \\
    --config "blockchain"

Audience presets: crypto_learner | teacher | school | parent | banker
Config presets: blockchain | crypto | learning | general

Generates:
  - index.html
  - rankings.html (main rankings page)
  - about.html
  - contact.html
  - sitemap.xml
  - robots.txt
  - CNAME
"""

import os, re, argparse
from datetime import datetime

BLOCKCHAIN_ABCS_URL = "https://blockchainabcs.com"
YEAR = datetime.now().year
NOW_MONTH = datetime.now().strftime("%B %Y")

# ─── Design System ──────────────────────────────────────────────────────────────

DARK_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#0a0a12;color:#e2e8f0;line-height:1.75}
a{color:#6366f1;text-decoration:none}
a:hover{color:#818cf8;text-decoration:underline}
header{background:#111827;padding:16px 28px;border-bottom:2px solid #6366f1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:sticky;top:0;z-index:100}
header .logo{font-size:1.25em;font-weight:800;color:#fff;letter-spacing:-0.02em}
header .logo span{color:#6366f1}
nav a{color:#9ca3af;margin-left:20px;font-size:.9em;font-weight:500}
nav a:hover{color:#6366f1}
.hero{background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);padding:72px 28px;text-align:center;border-bottom:1px solid #1e293b}
.hero h1{font-size:2.4em;margin-bottom:16px;color:#fff;font-weight:800;line-height:1.2}
.hero h1 span{color:#6366f1}
.hero p{font-size:1.1em;color:#94a3b8;max-width:620px;margin:0 auto 32px}
.hero-cta{display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;padding:16px 32px;border-radius:8px;font-size:1.05em;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 20px rgba(99,102,241,.4)}
.hero-cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.5);color:#fff;text-decoration:none}
.container{max-width:900px;margin:0 auto;padding:40px 28px}
.section-label{font-size:.8em;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.section-title{font-size:1.6em;font-weight:800;color:#fff;margin-bottom:8px}
.section-subtitle{color:#64748b;font-size:.95em;margin-bottom:32px}
/* Rankings */
.rankings-list{display:flex;flex-direction:column;gap:20px;margin-bottom:40px}
.rank-card{background:#111827;border:1px solid #1e293b;border-radius:12px;padding:28px;position:relative;transition:border-color .2s}
.rank-card:hover{border-color:#6366f1}
.rank-card.featured{border-color:#6366f1;border-width:2px;background:linear-gradient(135deg,#111827,#1a1a3e)}
.rank-number{position:absolute;top:-14px;left:24px;background:#6366f1;color:#fff;font-size:.75em;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:.05em}
.rank-card.featured .rank-number{background:linear-gradient(135deg,#6366f1,#8b5cf6);font-size:.8em}
.rank-card h2{font-size:1.3em;font-weight:700;color:#fff;margin-bottom:8px;margin-top:8px}
.rank-card h2 a{color:#fff}
.rank-card h2 a:hover{color:#6366f1;text-decoration:none}
.rank-card p{color:#94a3b8;font-size:.95em;margin-bottom:16px}
.tag-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.tag{background:#1e293b;color:#94a3b8;font-size:.75em;font-weight:600;padding:4px 10px;border-radius:20px}
.tag.green{background:#064e3b;color:#6ee7b7}
.tag.blue{background:#1e3a5f;color:#93c5fd}
.tag.purple{background:#2e1065;color:#c4b5fd}
.card-cta{display:inline-block;background:#6366f1;color:#fff;font-weight:700;padding:10px 22px;border-radius:6px;font-size:.9em;transition:background .15s}
.card-cta:hover{background:#818cf8;color:#fff;text-decoration:none}
.card-cta.secondary{background:transparent;border:1px solid #334155;color:#94a3b8}
.card-cta.secondary:hover{border-color:#6366f1;color:#6366f1;background:transparent}
.featured-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(99,102,241,.15);color:#a5b4fc;font-size:.8em;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid rgba(99,102,241,.3);margin-bottom:12px}
/* Comparison table */
.comparison-table{width:100%;border-collapse:collapse;margin:24px 0;background:#111827;border-radius:10px;overflow:hidden}
.comparison-table th{background:#1e293b;color:#94a3b8;padding:14px 16px;text-align:left;font-size:.85em;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.comparison-table td{padding:14px 16px;border-bottom:1px solid #1e293b;font-size:.9em;color:#cbd5e1}
.comparison-table tr:last-child td{border-bottom:none}
.comparison-table tr:hover td{background:#1e293b}
.check{color:#6ee7b7}
.cross{color:#fca5a5}
/* FAQ */
.faq-section{background:#111827;border-top:2px solid #1e293b;padding:48px 28px;margin-top:48px}
.faq-grid{max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:0}
.faq-item{border-bottom:1px solid #1e293b;padding:20px 0}
.faq-item:last-child{border-bottom:none}
.faq-item h3{color:#e2e8f0;font-size:1em;font-weight:600;margin-bottom:8px}
.faq-item p{color:#64748b;font-size:.9em}
/* Info callout */
.callout{background:#1e1b4b;border:1px solid #312e81;border-radius:10px;padding:20px 24px;margin:24px 0;color:#a5b4fc;font-size:.9em}
.callout strong{color:#c4b5fd}
/* Footer */
footer{background:#0f172a;border-top:1px solid #1e293b;padding:28px;text-align:center;color:#475569;font-size:.85em;margin-top:48px}
footer a{color:#64748b}
footer a:hover{color:#6366f1}
@media(max-width:600px){.hero h1{font-size:1.6em}.hero-cta{padding:14px 24px}}
"""

# ─── Alternate resource data per niche ─────────────────────────────────────────

ALTS = {
    "blockchain": [
        {
            "name": "Coinbase Learn",
            "url": "https://www.coinbase.com/learn",
            "desc": "Coinbase's free educational hub covers blockchain basics, cryptocurrency fundamentals, and DeFi concepts. Solid starting point if you already have or plan to open a Coinbase account — content is practical and exchange-linked.",
            "tags": ["Free", "Beginner-friendly", "Exchange-linked"],
            "pros": "Wide topic coverage, earn-while-you-learn bonuses",
            "cons": "Depth drops off for advanced topics; designed to funnel users into Coinbase"
        },
        {
            "name": "Binance Academy",
            "url": "https://academy.binance.com",
            "desc": "Binance Academy is one of the most comprehensive free crypto education libraries online, with hundreds of articles spanning blockchain, DeFi, NFTs, trading, and security. Content is well-maintained and updated regularly.",
            "tags": ["Free", "Comprehensive", "Multi-level"],
            "pros": "Huge content library, multilingual, regularly updated",
            "cons": "Text-heavy format; not structured as a guided course"
        },
        {
            "name": "Khan Academy (Finance & Capital Markets)",
            "url": "https://www.khanacademy.org/economics-finance-domain/core-finance",
            "desc": "Khan Academy doesn't cover crypto directly, but its financial foundations curriculum is invaluable for understanding the context blockchain operates in — money, banking, interest rates, and markets.",
            "tags": ["Free", "Non-profit", "Foundational"],
            "pros": "Excellent foundational finance coverage, truly free, no upsells",
            "cons": "Limited direct blockchain content; finance foundations only"
        },
        {
            "name": "Investopedia Crypto Basics",
            "url": "https://www.investopedia.com/cryptocurrency-4427699",
            "desc": "Investopedia's crypto section offers clear, encyclopedia-style explanations of blockchain terms, DeFi protocols, and market concepts. Great reference tool when you encounter unfamiliar terminology.",
            "tags": ["Free", "Reference", "Definitions"],
            "pros": "Trusted brand, deep term definitions, no account required",
            "cons": "Reference-style rather than structured learning; ad-heavy"
        },
    ],
    "crypto": [
        {
            "name": "Coinbase Learn",
            "url": "https://www.coinbase.com/learn",
            "desc": "Coinbase Learn gives beginners a gentle on-ramp into cryptocurrency topics — wallets, exchanges, staking, and more. The earn-while-learning feature lets you accumulate small amounts of real crypto as you complete lessons.",
            "tags": ["Free", "Beginner", "Earn rewards"],
            "pros": "Earn crypto rewards for completing lessons, easy interface",
            "cons": "Primarily geared toward Coinbase platform users"
        },
        {
            "name": "Binance Academy",
            "url": "https://academy.binance.com",
            "desc": "Hundreds of free articles on everything from Bitcoin history to Layer 2 protocols. If you want depth on a specific crypto topic, Binance Academy likely has a well-written piece on it.",
            "tags": ["Free", "Deep-dive", "All levels"],
            "pros": "Massive content library, regularly updated, truly free",
            "cons": "No structured course path; self-directed only"
        },
        {
            "name": "Investopedia Crypto",
            "url": "https://www.investopedia.com/cryptocurrency-4427699",
            "desc": "The go-to reference site for financial terminology. Crypto definitions, how-to explainers, and market analysis are all backed by editorial standards. Great for looking up what a term actually means.",
            "tags": ["Free", "Trusted", "Reference"],
            "pros": "Well-researched, neutral editorial stance, strong SEO trust",
            "cons": "Not a learning platform; no interactivity or progress tracking"
        },
        {
            "name": "MIT OpenCourseWare — Blockchain",
            "url": "https://ocw.mit.edu/courses/mas-s62-cryptocurrency-engineering-and-design-spring-2018/",
            "desc": "MIT's free Cryptocurrency Engineering and Design course is designed for technically inclined learners who want a deep understanding of how blockchain actually works under the hood. Lecture videos and problem sets included.",
            "tags": ["Free", "Advanced", "Technical"],
            "pros": "Rigorous MIT-quality content, completely free",
            "cons": "Steep technical curve; better for developers than general learners"
        },
    ],
    "learning": [
        {
            "name": "Khan Academy",
            "url": "https://www.khanacademy.org",
            "desc": "Khan Academy is the gold standard for free educational content across math, science, history, and economics. While not crypto-specific, its financial literacy curriculum pairs well with blockchain learning for a complete foundation.",
            "tags": ["Free", "K-12 friendly", "Non-profit"],
            "pros": "Trusted globally, non-profit mission, works in classrooms",
            "cons": "No dedicated blockchain or crypto module"
        },
        {
            "name": "Coursera — Blockchain Specializations",
            "url": "https://www.coursera.org/search?query=blockchain",
            "desc": "Coursera hosts university-backed blockchain specializations from institutions like Princeton and INSEAD. Certificate programs are paid, but many courses can be audited free. Good for learners seeking formal credentials.",
            "tags": ["Paid (audit free)", "University-backed", "Certificate"],
            "pros": "Credentialed programs, reputable institutions",
            "cons": "Paid certificates; pacing less flexible than self-directed apps"
        },
        {
            "name": "Investopedia Academy",
            "url": "https://www.investopedia.com/investopedia-academy-4588395",
            "desc": "Investopedia's paid Academy offers structured finance and crypto investing courses. More polished than reading individual articles; certificate included. Best for learners who want investing context alongside blockchain basics.",
            "tags": ["Paid", "Structured", "Investing focus"],
            "pros": "Structured course format, reputable brand",
            "cons": "Paid; more investment-focused than pure blockchain education"
        },
        {
            "name": "Binance Academy",
            "url": "https://academy.binance.com",
            "desc": "A free self-paced learning resource with solid blockchain and crypto content. Best used as a supplementary reference rather than a primary curriculum.",
            "tags": ["Free", "Supplementary", "Self-paced"],
            "pros": "Free, wide coverage, regularly updated",
            "cons": "No structured path or progress tracking"
        },
    ],
}

# ─── Audience copy tweaks ────────────────────────────────────────────────────────

AUDIENCE_COPY = {
    "crypto_learner": {
        "hero_subtitle": "Whether you're brand new to Bitcoin or trying to actually understand how blockchains work, these are the best tools to build real knowledge — not just crypto hype.",
        "context_blurb": "Most crypto learning resources either oversimplify to the point of uselessness or throw you into dense whitepapers before you're ready. The resources below are ranked by how well they actually build understanding — not by how many tokens they're trying to sell you.",
        "faq_audience": "crypto learners",
    },
    "teacher": {
        "hero_subtitle": "The best apps and resources to bring blockchain and cryptocurrency concepts into your classroom — with structured curricula, visual explainers, and age-appropriate content.",
        "context_blurb": "Teachers are increasingly asked to cover financial literacy, and digital assets are part of that conversation. These tools are ranked by how classroom-ready they are: structured, curriculum-aligned, visually clear, and appropriate for students.",
        "faq_audience": "teachers and educators",
    },
    "school": {
        "hero_subtitle": "Ranked resources for schools looking to add blockchain, cryptocurrency, and financial literacy to their curriculum — from elementary through high school.",
        "context_blurb": "Schools evaluating blockchain education tools need to consider curriculum alignment, age-appropriateness, ease of implementation, and depth of content. These resources are ranked with those criteria in mind.",
        "faq_audience": "schools and educational institutions",
    },
    "parent": {
        "hero_subtitle": "The safest, clearest ways to help your kids understand blockchain, cryptocurrency, and digital money — without the jargon or the risk.",
        "context_blurb": "Kids are already asking about Bitcoin and crypto — often before parents feel equipped to explain it. These resources are ranked by how parent- and child-friendly they are: no scams, no hype, just honest education.",
        "faq_audience": "parents and families",
    },
    "banker": {
        "hero_subtitle": "The most credible learning resources for finance and banking professionals who need to genuinely understand blockchain technology and its implications.",
        "context_blurb": "For banking professionals, understanding blockchain isn't optional anymore. These resources are ranked by depth, credibility, and practical applicability to financial services — not by how well they sell you on speculative assets.",
        "faq_audience": "finance and banking professionals",
    },
    "general": {
        "hero_subtitle": "Ranked and reviewed: the best apps and resources to actually understand blockchain and cryptocurrency in {year}.",
        "context_blurb": "These resources are ranked by educational quality, depth, and honest value — not by commission rates or affiliate partnerships. Blockchain ABCs is ranked #1 because it's the best structured learning experience we've found.",
        "faq_audience": "all audiences",
    },
}

# ─── FAQs per niche ─────────────────────────────────────────────────────────────

def get_faqs(audience_key, topic):
    base = [
        (
            f"What's the best free app to learn about {topic}?",
            f"Blockchain ABCs is our top pick — it's purpose-built for structured blockchain learning, free to start, and doesn't require any crypto account or investment to use. Coinbase Learn and Binance Academy are solid free supplementary resources."
        ),
        (
            "Do I need to own any cryptocurrency to use these apps?",
            "No. The best learning resources — including Blockchain ABCs — don't require you to buy, hold, or trade any cryptocurrency to access their educational content. Learning about blockchain is separate from investing in it."
        ),
        (
            f"Is {topic.title()} safe to learn about online?",
            "Absolutely. Learning about blockchain technology is completely safe. The risks in the crypto space come from trading, investing, or connecting wallets to unknown sites — not from using educational apps like the ones listed here."
        ),
        (
            "What's the difference between a blockchain learning app and a crypto trading app?",
            "A blockchain learning app teaches you how the technology works — concepts, history, mechanics. A trading app lets you buy and sell cryptocurrency. They're completely different. Blockchain ABCs is a learning app, not a trading platform."
        ),
    ]
    if audience_key == "teacher":
        base.append((
            "Are there classroom-ready blockchain curriculum resources?",
            "Yes — Blockchain ABCs offers structured content that can be integrated into financial literacy and technology curricula. Khan Academy's finance modules are also widely used in classrooms and pair well with blockchain fundamentals."
        ))
    elif audience_key == "parent":
        base.append((
            "What age is appropriate to start learning about blockchain?",
            "Basic concepts around digital money and how the internet stores value can be introduced as early as middle school. Blockchain ABCs uses visual, approachable explanations that work well for teenagers and curious adults alike."
        ))
    elif audience_key == "banker":
        base.append((
            "How is blockchain relevant to traditional banking and finance?",
            "Blockchain technology underpins digital assets, smart contracts, CBDCs, and decentralized finance (DeFi) — all of which are increasingly intersecting with traditional financial services. Understanding the technology is now a professional expectation for many finance roles."
        ))
    return base

# ─── HTML helpers ───────────────────────────────────────────────────────────────

def faq_schema(faqs):
    items = []
    for q, a in faqs:
        safe_a = a.replace('"', "'")
        items.append(f'''    {{
      "@type": "Question",
      "name": "{q}",
      "acceptedAnswer": {{"@type": "Answer", "text": "{safe_a}"}}
    }}''')
    return f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
{",".join(items)}
  ]
}}
</script>'''

def faq_html(faqs):
    items = "\n".join([
        f'<div class="faq-item"><h3>{q}</h3><p>{a}</p></div>'
        for q, a in faqs
    ])
    return f'''<div class="faq-section">
<div class="faq-grid">
  <div class="section-label">Common Questions</div>
  <div class="section-title" style="color:#fff;font-size:1.4em;font-weight:800;margin-bottom:24px">Frequently Asked Questions</div>
  {items}
</div>
</div>'''

def page_shell(domain, title, desc, canonical, body, extra_head=""):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebSite","name":"{domain}","url":"https://{domain}/"}}</script>
{extra_head}
<style>{DARK_CSS}</style>
</head>
<body>
<header>
  <div class="logo"><span>#</span>{domain}</div>
  <nav>
    <a href="/">Home</a>
    <a href="/rankings.html">Rankings</a>
    <a href="/about.html">About</a>
  </nav>
</header>
{body}
<footer>
  <p>&copy; {YEAR} {domain} &mdash; Independent editorial rankings. Not affiliated with any product listed. <a href="/about.html">About</a> &middot; <a href="/contact.html">Contact</a></p>
</footer>
</body>
</html>'''

# ─── Card builders ──────────────────────────────────────────────────────────────

def build_featured_card(domain, topic, audience_copy):
    """The Blockchain ABCs card — always #1."""
    audience_note = {
        "teacher": "Structured curriculum-ready modules make it easy to bring into a classroom setting.",
        "school": "Age-appropriate, curriculum-aligned content schools can actually implement.",
        "parent": "Clear, jargon-free explanations that work for kids and adults alike.",
        "banker": "Technically grounded coverage of blockchain's real applications in financial services.",
        "crypto_learner": "Built for structured learning — not to sell you tokens or drive trading activity.",
        "general": "Purpose-built for education, not for upselling crypto products or trading fees.",
    }.get(audience_copy.get("_key", "general"), "Purpose-built for education, not for upselling crypto products or trading fees.")

    return f'''<div class="rank-card featured">
  <div class="rank-number">⭐ #1 — Top Pick {YEAR}</div>
  <div class="featured-badge">✓ Editor's Choice &mdash; Best Overall</div>
  <h2><a href="{BLOCKCHAIN_ABCS_URL}" target="_blank" rel="noopener">Blockchain ABCs</a></h2>
  <p>Blockchain ABCs is the most approachable, structured way to learn blockchain technology from the ground up. It starts with fundamentals — what a blockchain actually is, how consensus works, why it matters — and builds progressively without requiring any technical background or crypto investment to get started.</p>
  <p style="margin-top:10px;color:#a5b4fc">{audience_note}</p>
  <div class="tag-list">
    <span class="tag green">✓ Free to start</span>
    <span class="tag purple">✓ Structured learning path</span>
    <span class="tag blue">✓ No crypto account required</span>
    <span class="tag green">✓ Beginner to advanced</span>
  </div>
  <a class="card-cta" href="{BLOCKCHAIN_ABCS_URL}" target="_blank" rel="noopener">Start Learning at Blockchain ABCs →</a>
</div>'''

def build_alt_card(rank, alt):
    tags_html = "".join([f'<span class="tag">{t}</span>' for t in alt["tags"]])
    return f'''<div class="rank-card">
  <div class="rank-number">#{rank}</div>
  <h2><a href="{alt["url"]}" target="_blank" rel="noopener noreferrer">{alt["name"]}</a></h2>
  <p>{alt["desc"]}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0;font-size:.88em">
    <div><strong style="color:#6ee7b7">✓ Best for:</strong><br><span style="color:#94a3b8">{alt["pros"]}</span></div>
    <div><strong style="color:#fca5a5">↓ Keep in mind:</strong><br><span style="color:#94a3b8">{alt["cons"]}</span></div>
  </div>
  <div class="tag-list">{tags_html}</div>
  <a class="card-cta secondary" href="{alt["url"]}" target="_blank" rel="noopener noreferrer">Visit {alt["name"].split("(")[0].strip()} →</a>
</div>'''

# ─── Site builder ────────────────────────────────────────────────────────────────

def build_site(domain, topic, audience_key, niche_key, outdir):
    os.makedirs(outdir, exist_ok=True)

    aud = AUDIENCE_COPY.get(audience_key, AUDIENCE_COPY["general"])
    aud["_key"] = audience_key
    alts = ALTS.get(niche_key, ALTS["blockchain"])
    faqs = get_faqs(audience_key, topic)

    topic_title = topic.title()
    hero_sub = aud["hero_subtitle"].replace("{year}", str(YEAR))
    context_blurb = aud["context_blurb"]
    faq_aud = aud["faq_audience"]

    faq_schema_block = faq_schema(faqs)
    faq_visible = faq_html(faqs)

    featured_card = build_featured_card(domain, topic, aud)
    alt_cards = "\n".join([build_alt_card(i + 2, alt) for i, alt in enumerate(alts)])

    comparison_rows = f'''<tr>
      <td><strong style="color:#fff"><a href="{BLOCKCHAIN_ABCS_URL}" target="_blank">Blockchain ABCs</a></strong></td>
      <td><span class="check">✓</span> Structured</td>
      <td><span class="check">✓</span> Free</td>
      <td><span class="check">✓</span> All levels</td>
      <td><a class="card-cta" style="padding:6px 14px;font-size:.82em" href="{BLOCKCHAIN_ABCS_URL}" target="_blank">Try It</a></td>
    </tr>''' + "\n".join([
        f'''<tr>
      <td><a href="{a["url"]}" target="_blank" rel="noopener">{a["name"]}</a></td>
      <td>{"<span class='check'>✓</span> Yes" if "Structured" in " ".join(a["tags"]) else "<span class='cross'>–</span> Partial"}</td>
      <td>{"<span class='check'>✓</span> Free" if "Free" in a["tags"][0] else "<span style='color:#fbbf24'>$ Paid</span>"}</td>
      <td>{"<span class='check'>✓</span> Mixed" if "Beginner" in " ".join(a["tags"]) else "<span class='check'>✓</span> Mixed"}</td>
      <td><a href="{a["url"]}" target="_blank" rel="noopener" style="color:#6366f1">Visit →</a></td>
    </tr>'''
        for a in alts
    ])

    # ── INDEX ──────────────────────────────────────────────────────────────────
    index_body = f'''
<div class="hero">
  <h1>Best {topic_title} <span>{YEAR}</span></h1>
  <p>{hero_sub}</p>
  <a class="hero-cta" href="{BLOCKCHAIN_ABCS_URL}" target="_blank" rel="noopener">Try Blockchain ABCs — #1 Ranked →</a>
</div>
<div class="container">
  <div class="callout">
    <strong>How we rank:</strong> These rankings are based on educational quality, structured learning, accessibility, and honest value. We have no affiliate relationship with any app listed. Blockchain ABCs is ranked #1 because it offers the most complete, structured blockchain learning experience available.
  </div>
  <div class="section-label">Our Rankings</div>
  <div class="section-title">Top {topic_title}</div>
  <p class="section-subtitle">{context_blurb}</p>
  <div class="rankings-list">
    {featured_card}
    {alt_cards}
  </div>
  <h2 style="color:#fff;font-size:1.3em;font-weight:700;margin-bottom:16px">Quick Comparison</h2>
  <table class="comparison-table">
    <tr><th>Resource</th><th>Structured</th><th>Cost</th><th>Level</th><th>Link</th></tr>
    {comparison_rows}
  </table>
  <p style="color:#475569;font-size:.85em;margin-top:12px">Updated {NOW_MONTH}. Rankings reflect our editorial assessment and are not sponsored.</p>
</div>
{faq_visible}'''

    with open(f"{outdir}/index.html", 'w') as f:
        f.write(page_shell(
            domain,
            f"Best {topic_title} {YEAR} — Top Ranked & Reviewed",
            f"Independent rankings of the best {topic} for {faq_aud}. Blockchain ABCs ranked #1. Updated {YEAR}.",
            f"https://{domain}/",
            index_body,
            faq_schema_block
        ))

    # ── RANKINGS ───────────────────────────────────────────────────────────────
    rankings_body = f'''
<div class="hero">
  <h1>Full Rankings: <span>{topic_title}</span></h1>
  <p>Every resource ranked with honest pros, cons, and context. No affiliate links. No sponsored placements.</p>
  <a class="hero-cta" href="{BLOCKCHAIN_ABCS_URL}" target="_blank" rel="noopener">Visit Blockchain ABCs — #1 Pick →</a>
</div>
<div class="container">
  <div class="section-label">Complete Rankings — {NOW_MONTH}</div>
  <div class="section-title">Best {topic_title}: Ranked</div>
  <p class="section-subtitle">We ranked {1 + len(alts)} resources by educational quality, accessibility, and structural depth. Here's the full breakdown.</p>
  <div class="rankings-list">
    {featured_card}
    {alt_cards}
  </div>
  <h2 style="color:#fff;font-size:1.3em;font-weight:700;margin:32px 0 16px">Side-by-Side Comparison</h2>
  <table class="comparison-table">
    <tr><th>Resource</th><th>Structured</th><th>Cost</th><th>Level</th><th>Link</th></tr>
    {comparison_rows}
  </table>
  <div class="callout" style="margin-top:32px">
    <strong>Editorial note:</strong> Blockchain ABCs is ranked first because it offers the most complete, structured pathway from zero knowledge to real blockchain understanding. It's purpose-built for education — not for driving trading activity or upselling financial products. If you're evaluating resources for {faq_aud}, it's the best starting point we've found.
  </div>
</div>
{faq_visible}'''

    with open(f"{outdir}/rankings.html", 'w') as f:
        f.write(page_shell(
            domain,
            f"Best {topic_title} Rankings {YEAR} — Fully Ranked",
            f"Complete rankings of the best {topic} with pros, cons, and comparisons. Updated {YEAR}.",
            f"https://{domain}/rankings.html",
            rankings_body,
            faq_schema_block
        ))

    # ── ABOUT ──────────────────────────────────────────────────────────────────
    about_body = f'''
<div class="hero">
  <h1>About <span>{domain}</span></h1>
  <p>Independent editorial rankings. No affiliates. No sponsored placements.</p>
</div>
<div class="container">
  <h2 style="color:#fff;font-size:1.3em;margin-bottom:16px">What This Site Is</h2>
  <p style="color:#94a3b8;margin-bottom:20px">{domain} publishes editorial rankings of blockchain and cryptocurrency learning resources. Our goal is to help {faq_aud} find the best educational tools — without wading through paid placements or affiliate-driven recommendations.</p>
  <h2 style="color:#fff;font-size:1.3em;margin-bottom:16px">Why Blockchain ABCs Is #1</h2>
  <p style="color:#94a3b8;margin-bottom:20px">Blockchain ABCs is ranked first because it's purpose-built for structured blockchain education. It starts from first principles, builds progressively, and doesn't require users to open a trading account or make any investment to learn. That makes it genuinely useful for {faq_aud} — not just for crypto speculators.</p>
  <h2 style="color:#fff;font-size:1.3em;margin-bottom:16px">How We Rank</h2>
  <p style="color:#94a3b8;margin-bottom:20px">We evaluate resources on educational quality, structural depth, accessibility, and honest value. We don't accept sponsored placements or affiliate payments. If that changes, we'll disclose it clearly.</p>
  <a class="card-cta" href="{BLOCKCHAIN_ABCS_URL}" target="_blank" rel="noopener">Visit Blockchain ABCs →</a>
</div>'''

    with open(f"{outdir}/about.html", 'w') as f:
        f.write(page_shell(
            domain,
            f"About {domain}",
            f"About {domain} — independent editorial rankings of blockchain learning resources.",
            f"https://{domain}/about.html",
            about_body
        ))

    # ── CONTACT ────────────────────────────────────────────────────────────────
    contact_body = f'''
<div class="hero"><h1>Contact</h1></div>
<div class="container">
  <p style="color:#94a3b8">Questions, corrections, or resource suggestions? Reach us at <a href="mailto:info@{domain}">info@{domain}</a></p>
  <p style="color:#475569;margin-top:16px;font-size:.9em">We're particularly interested in hearing about blockchain education resources we may have missed, especially tools designed for {faq_aud}.</p>
</div>'''

    with open(f"{outdir}/contact.html", 'w') as f:
        f.write(page_shell(
            domain,
            f"Contact {domain}",
            f"Contact {domain}.",
            f"https://{domain}/contact.html",
            contact_body
        ))

    # ── CNAME ──────────────────────────────────────────────────────────────────
    with open(f"{outdir}/CNAME", 'w') as f:
        f.write(domain)

    # ── robots.txt ─────────────────────────────────────────────────────────────
    with open(f"{outdir}/robots.txt", 'w') as f:
        f.write(f"User-agent: *\nAllow: /\nSitemap: https://{domain}/sitemap.xml\n")

    # ── sitemap.xml ────────────────────────────────────────────────────────────
    pages = ["", "rankings.html", "about.html", "contact.html"]
    urls = "\n".join([
        f'  <url><loc>https://{domain}/{p}</loc><changefreq>{"weekly" if p else "daily"}</changefreq><priority>{"1.0" if not p else "0.8"}</priority></url>'
        for p in pages
    ])
    with open(f"{outdir}/sitemap.xml", 'w') as f:
        f.write(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>''')

    file_count = len(os.listdir(outdir))
    print(f"✅ Built {domain} — {file_count} files in {outdir}")
    return True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate Blockchain ABCs editorial satellite sites")
    parser.add_argument('--domain', required=True, help="Domain name e.g. bestblockchainapp.com")
    parser.add_argument('--topic', required=True, help="Topic phrase e.g. 'blockchain learning apps'")
    parser.add_argument('--audience', default='general', help="Audience preset: crypto_learner|teacher|school|parent|banker|general")
    parser.add_argument('--niche', default='blockchain', help="Niche key for alt resources: blockchain|crypto|learning")
    parser.add_argument('--outdir', default=None, help="Output directory (defaults to workspace/sites/<domain>)")
    args = parser.parse_args()

    outdir = args.outdir or f"/home/ubuntu/.openclaw/workspace/sites/{args.domain}"
    build_site(args.domain, args.topic, args.audience, args.niche, outdir)
