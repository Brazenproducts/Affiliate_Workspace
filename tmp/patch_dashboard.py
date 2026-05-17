#!/usr/bin/env python3
"""Patch the Axl affiliate dashboard to add 32 missing sites."""

DASHBOARD = "/home/ubuntu/.openclaw/workspace/tmp/axl-dashboard/index.html"

# New sites to add (domain, niche, commission_pct, comm_class, est_sale, notes)
NEW_SITES = [
    ("amerikantool.com",          "Tools",                  "3.0%", "c-green", "$2.40", "sites/amerikantool.com"),
    ("amishfirewood.com",         "Firewood",               "4.0%", "c-green", "$3.20", "sites/amishfirewood.com"),
    ("appalachianfirewood.com",   "Firewood",               "4.0%", "c-green", "$3.20", "sites/appalachianfirewood.com"),
    ("bedtread.com",              "Automotive",             "4.5%", "c-gold",  "$3.60", "sites/bedtread.com"),
    ("bestfiltering.com",         "HVAC/Filters",           "4.0%", "c-green", "$3.20", "sites/bestfiltering.com"),
    ("besthardfirewood.com",      "Firewood",               "4.0%", "c-green", "$3.20", "sites/besthardfirewood.com"),
    ("besthousefilter.com",       "Home Filters",           "4.0%", "c-green", "$3.20", "sites/besthousefilter.com"),
    ("cabrettaleather.com",       "Leather Goods",          "4.0%", "c-green", "$3.20", "sites/cabrettaleather.com"),
    ("cabrettaleathergloves.com", "Leather Gloves",         "4.0%", "c-green", "$3.20", "sites/cabrettaleathergloves.com"),
    ("cushionmasters.com",        "Seat Cushions",          "3.0%", "c-green", "$2.40", "sites/cushionmasters.com"),
    ("dragonfirewood.com",        "Fire Pits",              "4.0%", "c-green", "$3.20", "sites/dragonfirewood.com"),
    ("fungolfbag.com",            "Golf",                   "4.0%", "c-green", "$3.20", "sites/fungolfbag.com"),
    ("funnygolfgear.com",         "Golf",                   "4.0%", "c-green", "$3.20", "sites/funnygolfgear.com"),
    ("funnygolfgift.com",         "Golf",                   "4.0%", "c-green", "$3.20", "sites/funnygolfgift.com"),
    ("gladiatorjeepclub.com",     "Automotive",             "4.5%", "c-gold",  "$3.60", "sites/gladiatorjeepclub.com"),
    ("hellfirewood.com",          "Fire Starting",          "4.0%", "c-green", "$3.20", "sites/hellfirewood.com"),
    ("kitchenfireextinguishers.com", "Kitchen/Safety",      "4.0%", "c-green", "$3.20", "sites/kitchenfireextinguishers.com"),
    ("molleattachments.com",      "MOLLE",                  "4.0%", "c-green", "$3.20", "sites/molleattachments.com — Bartact #1"),
    ("mollesystems.com",          "MOLLE",                  "4.0%", "c-green", "$3.20", "sites/mollesystems.com — Bartact #1"),
    ("muricantool.com",           "Tools",                  "3.0%", "c-green", "$2.40", "sites/muricantool.com"),
    ("outdoorseatingcushion.com", "Outdoor Cushions",       "3.0%", "c-green", "$2.40", "sites/outdoorseatingcushion.com"),
    ("rangewolf.com",             "Kitchen",                "4.5%", "c-gold",  "$3.60", "sites/rangewolf.com"),
    ("ridgeutv.com",              "UTV/Automotive",         "4.5%", "c-gold",  "$3.60", "sites/ridgeutv.com"),
    ("stoutpart.com",             "Automotive",             "4.5%", "c-gold",  "$3.60", "sites/stoutpart.com"),
    ("stoutparts.com",            "Automotive",             "4.5%", "c-gold",  "$3.60", "sites/stoutparts.com"),
    ("strapratchets.com",         "Straps",                 "3.0%", "c-green", "$2.40", "sites/strapratchets.com — Bull Strap #1"),
    ("strapstiedown.com",         "Straps",                 "3.0%", "c-green", "$2.40", "sites/strapstiedown.com — Bull Strap #1"),
    ("usaseatcushion.com",        "Seat Cushions",          "4.0%", "c-green", "$3.20", "sites/usaseatcushion.com"),
    ("wagoneersparts.com",        "Automotive",             "4.5%", "c-gold",  "$3.60", "sites/wagoneersparts.com"),
    ("weldapparel.com",           "Welding",                "3.0%", "c-green", "$2.40", "sites/weldapparel.com"),
    ("weldaprons.com",            "Welding",                "3.0%", "c-green", "$2.40", "sites/weldaprons.com"),
    ("weldingsleeves.com",        "Welding",                "3.0%", "c-green", "$2.40", "sites/weldingsleeves.com"),
]

def make_row(num, domain, niche, commission, comm_class, est_sale, notes):
    return f"""<tr class="row-live">
<td class="num">{num}</td>
<td class="domain"><a href="https://{domain}" target="_blank" rel="noopener">{domain}</a></td>
<td class="num">—</td>
<td class="center"><span class="badge ok">✓</span></td>
<td class="center"><span class="badge ok">✓</span></td>
<td class="center"><span class="badge ok">✓</span></td>
<td>{niche}</td>
<td class="center"><span class="{comm_class}">{commission}</span></td>
<td class="num muted">{est_sale}</td>
<td class="num muted">—</td>
<td class="num muted">—</td>
<td class="num muted">—</td>
<td class="num muted">—</td>
<td class="notes">{notes}</td>
</tr>"""

with open(DASHBOARD, "r", encoding="utf-8") as f:
    html = f.read()

# Find current last row number in Amazon section
import re
# The Amazon section ends at the first </tbody> after the Amazon section header
amazon_section_start = html.index('<h2>💰 Amazon Affiliate Sites')
amazon_tbody_end = html.index('</tbody>', amazon_section_start)
amazon_section = html[amazon_section_start:amazon_tbody_end]

# Find the last row number
row_nums = re.findall(r'<td class="num">(\d+)</td>', amazon_section)
last_row = int(row_nums[-1]) if row_nums else 0
print(f"Last Amazon row number: {last_row}")

# Build new rows starting at last_row + 1
rows_html = "\n".join(
    make_row(last_row + 1 + i, domain, niche, comm, cls, est, notes)
    for i, (domain, niche, comm, cls, est, notes) in enumerate(NEW_SITES)
)

new_count = last_row + len(NEW_SITES)

# Insertion point: right before the closing </tbody> of the Amazon section
anchor_end = html[amazon_tbody_end - 6:amazon_tbody_end + 8]  # context around </tbody>
print(f"Anchor context: {repr(anchor_end)}")

# Replace the </tbody> in the Amazon section
before = html[:amazon_tbody_end]
after = html[amazon_tbody_end:]
html = before + "\n" + rows_html + "\n      " + after

# Update count-pill for Amazon section
old_pill = f'<h2>💰 Amazon Affiliate Sites <span class="count-pill">{last_row}</span></h2>'
new_pill = f'<h2>💰 Amazon Affiliate Sites <span class="count-pill">{new_count}</span></h2>'
if old_pill in html:
    html = html.replace(old_pill, new_pill, 1)
    print(f"Updated count-pill: {last_row} -> {new_count}")
else:
    print(f"WARNING: count-pill not found for {last_row}")

# Update stats: Total Sites Built
old_built_match = re.search(r'<div class="label">Total Sites Built</div><div class="val">(\d+)</div>', html)
if old_built_match:
    old_built = int(old_built_match.group(1))
    new_built = old_built + len(NEW_SITES)
    html = html.replace(old_built_match.group(0),
        f'<div class="label">Total Sites Built</div><div class="val">{new_built}</div>', 1)
    print(f"Updated Total Sites Built: {old_built} -> {new_built}")

with open(DASHBOARD, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Done! Added {len(NEW_SITES)} sites (rows {last_row+1}-{new_count}).")
