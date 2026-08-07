#!/usr/bin/env python3
"""Inject expanded editorial content into thin elipacko-usa.com pages."""

import os

BASE = '/home/ubuntu/.openclaw/workspace/elipacko-usa.com'

# ── SEAFOOD PACKAGING ──────────────────────────────────────────────
# Inject after the applications table section
SEAFOOD_EXPANSION = '''
<section style="background:#fff" id="pp-vs-ice-boxes">
  <div class="section-inner" style="max-width:1100px;margin:0 auto">
    <div class="label" style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a6bdb;margin-bottom:6px">Buyer's Guide</div>
    <h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:14px">Choosing the Right Seafood Container: PP vs Styrofoam vs Wax Cardboard</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Three materials dominate the seafood packaging market — expanded polystyrene (Styrofoam), wax-coated cardboard, and polypropylene (PP) corrugated. Each has a distinct cost and performance profile that determines which application it suits best.</p>
    <table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:20px 0">
      <tr style="background:#0a2540;color:#fff"><th style="padding:11px 14px;text-align:left;font-weight:600">Property</th><th style="padding:11px 14px;text-align:left;font-weight:600">PP Corrugated (Elipacko)</th><th style="padding:11px 14px;text-align:left;font-weight:600">Styrofoam (EPS)</th><th style="padding:11px 14px;text-align:left;font-weight:600">Wax Cardboard</th></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Waterproof</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ 100%</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ Yes</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Partial — wax degrades</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Reusable</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ 50–200 cycles</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">✗ Single-use</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">✗ Single-use</td></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Blast-freeze rated</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ −40°F</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ Yes</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">✗ Degrades when frozen wet</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Pressure washable</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ Yes</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">✗ Crumbles</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">✗ Destroyed</td></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Recyclable</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ PP #5</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Limited (#6, low uptake)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">✗ Wax contaminates paper</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">HACCP color-coding</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">✓ Any color</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">White only (typically)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Limited</td></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Cost per trip (at 100 cycles)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">$0.10–$0.30</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">$1.50–$8.00</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">$1.00–$5.00</td></tr>
    </table>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">When to Use Styrofoam</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">EPS foam remains the right call for one-way consumer direct-to-door seafood shipments — its insulation value per dollar is unmatched for e-commerce seafood boxes. But for portside, processing plant, distribution, and wholesale applications where boxes return to the source, PP corrugated delivers 10–30× lower cost per trip with far better hygiene and handling characteristics.</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">The Wax Box Replacement Opportunity</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Wax-coated cardboard is the dominant format in US fresh fish retail today — but regulatory pressure is increasing on wax box disposal (wax contaminates paper recycling streams and must be landfilled), and the cost-per-trip economics of wax cardboard deteriorate rapidly as labor, disposal, and box purchase costs rise. US produce DCs that have switched to PP corrugated returnable boxes report 90%+ packaging cost reductions within 18 months. The same economics apply to fresh and chilled seafood distribution.</p>
  </div>
</section>

<section style="background:#f0f9ff" id="sourcing">
  <div class="section-inner" style="max-width:1100px;margin:0 auto">
    <div class="label" style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#0369a1;margin-bottom:6px">Sourcing</div>
    <h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:14px">Why Source Seafood Packaging from Elipacko?</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Elipacko is among Asia's largest PP corrugated manufacturers — 50,000+ tons annual output, 20+ production lines, 400+ staff across facilities in Thailand, Vietnam, and China. For US seafood processors and distributors, this matters for three specific reasons:</p>
    <ul style="padding-left:22px;color:#374151;font-size:.96rem;line-height:1.88;margin-bottom:14px">
      <li style="margin-bottom:8px"><strong>0% anti-dumping duty (Thailand):</strong> Thailand-manufactured PP seafood containers enter the US at zero ADD — saving 25%+ on landed cost vs Chinese-manufactured alternatives subject to AD/CVD duties.</li>
      <li style="margin-bottom:8px"><strong>Custom spec without MOQ barriers:</strong> Portside totes, processing trays, retail ice boxes, and export containers can all be produced to your exact specification from a single container-load order — no million-unit runs required.</li>
      <li style="margin-bottom:8px"><strong>FDA documentation included:</strong> Every Elipacko shipment includes material certificates confirming FDA 21 CFR 177.1520 compliance — required by US seafood processors for HACCP documentation and food safety audits.</li>
      <li style="margin-bottom:8px"><strong>USA Manufacturing coming soon:</strong> Elipacko is establishing US production capability — domestic lead times and no freight delay for repeat orders.</li>
    </ul>
  </div>
</section>
'''

SEAFOOD_INJECT_AFTER = '<section style="background:var(--gray)" id="applications-seafood">'
SEAFOOD_INJECT_BEFORE = '<section style="background:#fff" id="pp-vs-wax-seafood">'

# ── VOTING BOOTHS EXPANSION ────────────────────────────────────────
VOTING_EXPANSION = '''
<section style="background:#f7f9fc">
  <div class="section-inner" style="max-width:1100px;margin:0 auto">
    <div class="label" style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a6bdb;margin-bottom:6px">Buyer's Guide</div>
    <h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:14px">What to Look For When Sourcing PP Voting Booths</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">PP corrugated voting booths vary significantly in quality, durability, and print fidelity between manufacturers. Electoral commissions and procurement teams sourcing at volume should evaluate suppliers on four key criteria:</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">1. Wall Thickness and PP Grade</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">The cheapest voting booths on the market use 3mm or even 2mm PP corrugated with recycled polymer content. These feel flimsy, collapse under light lateral pressure, and show visible creasing after a single election cycle. Election-grade booths should use 4–5mm virgin PP corrugated with a minimum weight of 700–900 g/m². Elipacko produces all voting booth panels in virgin PP — no recycled content, consistent mechanical properties across every unit in the order.</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">2. Print Quality and Fade Resistance</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Electoral commission seals, national flag colors, and instructional text must remain legible across multiple election cycles and outdoor staging in varying light and weather conditions. UV-resistant printing — either screen print with UV-cured inks or digital-direct UV print — is the minimum standard for election-grade booths. Print that flakes, fades, or smears within one election cycle creates public confidence problems and procurement failures. Elipacko uses UV-cured print processes on all branded booth panels.</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">3. Connector System Reliability</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">The panel connector — the mechanism that holds the three (or four) panels together in voting configuration — is the most critical structural component of a flat-pack voting booth. Poor connectors create booths that collapse mid-election or require constant repositioning. Elipacko's snap-peg PP connector system uses precision-molded PP connectors with a positive click engagement — panels cannot separate under lateral voting pressure without deliberate disassembly force.</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">4. Container Load Density</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">For national election deployments, shipping efficiency directly determines per-unit landed cost. A 40HQ container of flat-packed PP corrugated voting booths holds far more units than equivalent wooden or metal booth orders — reducing freight cost per booth and simplifying nationwide distribution logistics. Elipacko optimizes panel count and stacking configuration for maximum container density on every order.</p>
  </div>
</section>

<section style="background:#fff">
  <div class="section-inner" style="max-width:1100px;margin:0 auto">
    <div class="label" style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a6bdb;margin-bottom:6px">Case Reference</div>
    <h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:14px">INEC Nigeria — National Election Deployment</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Elipacko has supplied PP corrugated voting booths to INEC — Nigeria's Independent National Electoral Commission — for national election deployments. With over 176,000 polling units across Nigeria, INEC's procurement requirements demand container-load volumes, consistent build quality, reliable branding, and rapid production timelines. Elipacko's manufacturing capacity and flat-pack logistics make large-scale national election deployments operationally feasible at competitive per-unit cost.</p>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Electoral commissions in other countries — particularly in Africa, Southeast Asia, and Latin America — have similar procurement profiles: tens of thousands to hundreds of thousands of booths needed within a defined pre-election timeline, with strict branding specifications and defined durability requirements. Elipacko is set up to serve these requirements with dedicated production scheduling and export documentation.</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin:20px 0"><p style="margin:0;font-size:.9rem;color:#0c4a6e"><strong>For electoral commissions and procurement offices:</strong> Elipacko can provide pre-production samples, full specification sheets with panel thickness and print color certifications, and SGS inspection reports on request. Contact info@elipacko.com with your quantity, timeline, and specification requirements.</p></div>
  </div>
</section>
'''

VOTING_INJECT_BEFORE = '<section style="background:var(--gray)">\n  <div class="section-inner">\n    <div class="label">Specifications</div>'

# ── COLD CHAIN EXPANSION ────────────────────────────────────────────
COLD_EXPANSION = '''
<section style="background:#fff">
  <div class="section-inner" style="max-width:1100px;margin:0 auto">
    <div class="label" style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a6bdb;margin-bottom:6px">Buyer's Guide</div>
    <h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:14px">PP Corrugated Cold Chain Packaging — What to Specify</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Specifying PP corrugated for cold chain applications requires understanding how wall thickness, polymer grade, and box construction affect performance across the full temperature and handling cycle. Here's what procurement teams and supply chain engineers need to know:</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">Wall Thickness vs Temperature Range</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">PP corrugated retains mechanical properties across its full temperature range (−40°F to 212°F) regardless of wall thickness. However, thicker walls provide greater stack strength and resistance to lateral impact — both critical in cold chain environments where boxes are handled in gloves, moved by forklift, and stacked in tight cold room configurations. Standard cold chain recommendation: 6mm for produce and protein applications; 8mm for blast-freeze environments and heavy seafood totes; 4mm for lightweight pharmaceutical inserts.</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">Copolymer vs Homopolymer PP</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">PP corrugated sheet is manufactured from either homopolymer PP (higher stiffness, slightly more brittle at low temperatures) or copolymer PP (better impact resistance at cold temperatures, slightly lower stiffness). For cold chain applications — particularly blast-freeze cycles where boxes experience rapid temperature changes — copolymer PP is the preferred specification. Elipacko uses PP copolymer as standard for all cold chain packaging products.</p>
    <h3 style="font-size:1.05rem;font-weight:700;color:#0a2540;margin:24px 0 10px">Box Construction for Cold Chain</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Cold chain PP corrugated boxes are typically constructed with metal rivets or PP heat-welded corners rather than adhesive or tape — cold temperatures cause adhesive to fail, and tape loses grip below 32°F. Drain plug options (removable grommet) allow ice melt drainage in seafood and produce applications without compromise to box structural integrity. Lid-and-base configurations with positive retention clips prevent lids from popping off during forklift movement in cold rooms.</p>
    <table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:20px 0">
      <tr style="background:#0a2540;color:#fff"><th style="padding:11px 14px;text-align:left;font-weight:600">Cold Chain Application</th><th style="padding:11px 14px;text-align:left;font-weight:600">Recommended Wall</th><th style="padding:11px 14px;text-align:left;font-weight:600">Key Construction Feature</th><th style="padding:11px 14px;text-align:left;font-weight:600">Temperature Range</th></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Fresh produce (ambient cold room)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">4–6mm</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Vent holes, open-top</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">32°F to 45°F</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Fresh seafood (iced)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">6mm</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Drain plug, riveted corners</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">28°F to 34°F</td></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Blast-freeze (IQF)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">6–8mm copolymer</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">No drain, sealed base</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">−40°F to −20°F</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Frozen storage/distribution</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">6mm</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Lid + clip retention</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">−20°F continuous</td></tr>
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Pharmaceutical (insulated)</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">4mm outer + liner</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Liner-compatible interior</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">2°C to 8°C hold</td></tr>
    </table>
  </div>
</section>

<section style="background:#f0f4ff">
  <div class="section-inner" style="max-width:1100px;margin:0 auto">
    <div class="label" style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a6bdb;margin-bottom:6px">Sourcing</div>
    <h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:14px">0% Anti-Dumping Duty — Cold Chain Advantage</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">For US cold chain operators sourcing PP corrugated packaging at volume, the import duty profile of their supplier matters significantly to landed cost. PP corrugated boxes from China are subject to AD/CVD duties as of January 2026. Elipacko's Thailand-manufactured product enters the US at 0% anti-dumping duty — a 25%+ cost advantage on landed price compared to Chinese-manufactured alternatives, all else equal.</p>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">At cold chain volumes — a single US protein processor may consume 50,000–500,000 boxes per year — a 25% duty difference translates to $500,000–$5,000,000 in annual landed cost savings just from country-of-origin optimization. Elipacko provides the country-of-origin documentation and HTS classification support needed for US Customs entry.</p>
  </div>
</section>
'''

COLD_INJECT_BEFORE = '<section style="background:var(--gray)">\n  <div class="section-inner">\n    <div class="label">Applications</div>'

pages = [
    {
        'file': 'seafood-packaging/index.html',
        'inject': SEAFOOD_EXPANSION,
        'before': SEAFOOD_INJECT_BEFORE,
        'after': None,
    },
    {
        'file': 'pp-voting-booths/index.html',
        'inject': VOTING_EXPANSION,
        'before': VOTING_INJECT_BEFORE,
        'after': None,
    },
    {
        'file': 'cold-chain-packaging/index.html',
        'inject': COLD_EXPANSION,
        'before': COLD_INJECT_BEFORE,
        'after': None,
    },
]

for page in pages:
    path = os.path.join(BASE, page['file'])
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    before = page.get('before')
    inject = page['inject']

    if before and before in content:
        content = content.replace(before, inject + '\n' + before, 1)
        result = 'injected before marker'
    else:
        # Try a more flexible match on first part of the before string
        short = before[:60] if before else ''
        idx = content.find(short)
        if idx > -1:
            content = content[:idx] + inject + '\n' + content[idx:]
            result = 'injected (partial match)'
        else:
            result = f'MARKER NOT FOUND — skipped'

    if 'skipped' not in result:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

    words = len(content.split())
    print(f'{page["file"]}: {words} words — {result}')
