#!/usr/bin/env python3
"""Expand vehicle finder dropdown on bestseatcover.com to cover all major makes/models.
Routes to existing review pages where they exist, or builds Amazon affiliate
search URL fallback for makes/models without dedicated pages."""
import re, base64, json, urllib.request, os, sys

GH_TOKEN = os.environ['GH_TOKEN']
REPO = 'bestseatcover.com'
AMAZON_TAG = 'brazenprodu01-20'

# Expanded vehicle data:
# - 'page' = local review page if we have one
# - 'amazonQuery' = Amazon search query string when no local page exists
EXPANDED_DATA = """
    var vehicleData = {
      'Jeep': {
        'Wrangler TJ': { years: '1997-2006', page: 'best-jeep-seat-covers.html' },
        'Wrangler JK': { years: '2007-2010', page: 'best-jeep-seat-covers.html' },
        'Wrangler JKU': { years: '2007-2018', page: 'best-jeep-seat-covers.html' },
        'Wrangler JL': { years: '2018-2026', page: 'best-jeep-seat-covers.html' },
        'Wrangler JLU': { years: '2018-2026', page: 'best-jeep-seat-covers.html' },
        'Gladiator': { years: '2020-2026', page: 'best-jeep-gladiator-seat-covers.html' },
        'Cherokee': { years: '2014-2023', amazonQuery: 'Jeep Cherokee seat covers' },
        'Grand Cherokee': { years: '2011-2026', amazonQuery: 'Jeep Grand Cherokee seat covers' },
        'Compass': { years: '2017-2026', amazonQuery: 'Jeep Compass seat covers' },
        'Renegade': { years: '2015-2026', amazonQuery: 'Jeep Renegade seat covers' }
      },
      'Toyota': {
        'Tacoma (2nd Gen)': { years: '2005-2015', page: 'best-toyota-tacoma-seat-covers.html' },
        'Tacoma (3rd Gen)': { years: '2016-2023', page: 'best-toyota-tacoma-seat-covers.html' },
        'Tacoma (4th Gen)': { years: '2024-2026', page: 'best-toyota-tacoma-seat-covers.html' },
        '4Runner': { years: '2010-2026', page: 'best-toyota-4runner-seat-covers.html' },
        'Tundra': { years: '2007-2026', page: 'best-toyota-tundra-seat-covers.html' },
        'Land Cruiser': { years: '1998-2026', amazonQuery: 'Toyota Land Cruiser seat covers' },
        'Sequoia': { years: '2008-2026', amazonQuery: 'Toyota Sequoia seat covers' },
        'RAV4': { years: '2013-2026', amazonQuery: 'Toyota RAV4 seat covers' },
        'Highlander': { years: '2008-2026', amazonQuery: 'Toyota Highlander seat covers' }
      },
      'Ford': {
        'Bronco': { years: '2021-2026', page: 'best-ford-bronco-seat-covers.html' },
        'Bronco Sport': { years: '2021-2026', amazonQuery: 'Ford Bronco Sport seat covers' },
        'F-150': { years: '2009-2026', page: 'best-ford-f150-seat-covers.html' },
        'F-250 Super Duty': { years: '2011-2026', amazonQuery: 'Ford F-250 Super Duty seat covers' },
        'F-350 Super Duty': { years: '2011-2026', amazonQuery: 'Ford F-350 Super Duty seat covers' },
        'Ranger': { years: '2019-2026', page: 'best-ford-ranger-seat-covers.html' },
        'Maverick': { years: '2022-2026', amazonQuery: 'Ford Maverick seat covers' },
        'Explorer': { years: '2011-2026', amazonQuery: 'Ford Explorer seat covers' },
        'Expedition': { years: '2007-2026', amazonQuery: 'Ford Expedition seat covers' },
        'Mustang': { years: '2005-2026', amazonQuery: 'Ford Mustang seat covers' }
      },
      'Chevrolet': {
        'Silverado 1500': { years: '2007-2026', page: 'best-chevy-silverado-seat-covers.html' },
        'Silverado 2500HD': { years: '2007-2026', amazonQuery: 'Chevrolet Silverado 2500HD seat covers' },
        'Silverado 3500HD': { years: '2007-2026', amazonQuery: 'Chevrolet Silverado 3500HD seat covers' },
        'Colorado': { years: '2015-2026', page: 'best-chevy-colorado-seat-covers.html' },
        'Tahoe': { years: '2007-2026', amazonQuery: 'Chevrolet Tahoe seat covers' },
        'Suburban': { years: '2007-2026', amazonQuery: 'Chevrolet Suburban seat covers' },
        'Trailblazer': { years: '2021-2026', amazonQuery: 'Chevrolet Trailblazer seat covers' },
        'Equinox': { years: '2010-2026', amazonQuery: 'Chevrolet Equinox seat covers' },
        'Camaro': { years: '2010-2024', amazonQuery: 'Chevrolet Camaro seat covers' },
        'Corvette': { years: '2014-2026', amazonQuery: 'Chevrolet Corvette seat covers' }
      },
      'GMC': {
        'Sierra 1500': { years: '2007-2026', amazonQuery: 'GMC Sierra 1500 seat covers' },
        'Sierra 2500HD': { years: '2007-2026', amazonQuery: 'GMC Sierra 2500HD seat covers' },
        'Sierra 3500HD': { years: '2007-2026', amazonQuery: 'GMC Sierra 3500HD seat covers' },
        'Canyon': { years: '2015-2026', amazonQuery: 'GMC Canyon seat covers' },
        'Yukon': { years: '2007-2026', amazonQuery: 'GMC Yukon seat covers' },
        'Yukon XL': { years: '2007-2026', amazonQuery: 'GMC Yukon XL seat covers' },
        'Acadia': { years: '2007-2026', amazonQuery: 'GMC Acadia seat covers' },
        'Hummer EV': { years: '2022-2026', amazonQuery: 'GMC Hummer EV seat covers' }
      },
      'Ram': {
        '1500': { years: '2009-2026', page: 'best-ram-1500-seat-covers.html' },
        '2500': { years: '2010-2026', amazonQuery: 'Ram 2500 seat covers' },
        '3500': { years: '2010-2026', amazonQuery: 'Ram 3500 seat covers' },
        'TRX': { years: '2021-2024', amazonQuery: 'Ram TRX seat covers' }
      },
      'Dodge': {
        'Durango': { years: '2011-2026', amazonQuery: 'Dodge Durango seat covers' },
        'Charger': { years: '2011-2024', amazonQuery: 'Dodge Charger seat covers' },
        'Challenger': { years: '2008-2024', amazonQuery: 'Dodge Challenger seat covers' }
      },
      'Nissan': {
        'Frontier': { years: '2005-2026', amazonQuery: 'Nissan Frontier seat covers' },
        'Titan': { years: '2004-2024', amazonQuery: 'Nissan Titan seat covers' },
        'Titan XD': { years: '2016-2024', amazonQuery: 'Nissan Titan XD seat covers' },
        'Pathfinder': { years: '2013-2026', amazonQuery: 'Nissan Pathfinder seat covers' },
        'Armada': { years: '2017-2026', amazonQuery: 'Nissan Armada seat covers' },
        'Rogue': { years: '2014-2026', amazonQuery: 'Nissan Rogue seat covers' },
        'Murano': { years: '2015-2026', amazonQuery: 'Nissan Murano seat covers' }
      },
      'Honda': {
        'Ridgeline': { years: '2017-2026', amazonQuery: 'Honda Ridgeline seat covers' },
        'Pilot': { years: '2009-2026', amazonQuery: 'Honda Pilot seat covers' },
        'Passport': { years: '2019-2026', amazonQuery: 'Honda Passport seat covers' },
        'CR-V': { years: '2012-2026', amazonQuery: 'Honda CR-V seat covers' },
        'Odyssey': { years: '2011-2026', amazonQuery: 'Honda Odyssey seat covers' }
      },
      'Subaru': {
        'Outback': { years: '2010-2026', amazonQuery: 'Subaru Outback seat covers' },
        'Forester': { years: '2014-2026', amazonQuery: 'Subaru Forester seat covers' },
        'Crosstrek': { years: '2013-2026', amazonQuery: 'Subaru Crosstrek seat covers' },
        'Ascent': { years: '2019-2026', amazonQuery: 'Subaru Ascent seat covers' },
        'Wilderness': { years: '2022-2026', amazonQuery: 'Subaru Wilderness seat covers' }
      },
      'Tesla': {
        'Model 3': { years: '2017-2026', amazonQuery: 'Tesla Model 3 seat covers' },
        'Model Y': { years: '2020-2026', amazonQuery: 'Tesla Model Y seat covers' },
        'Model S': { years: '2012-2026', amazonQuery: 'Tesla Model S seat covers' },
        'Model X': { years: '2015-2026', amazonQuery: 'Tesla Model X seat covers' },
        'Cybertruck': { years: '2024-2026', amazonQuery: 'Tesla Cybertruck seat covers' }
      },
      'Rivian': {
        'R1T': { years: '2022-2026', amazonQuery: 'Rivian R1T seat covers' },
        'R1S': { years: '2022-2026', amazonQuery: 'Rivian R1S seat covers' }
      }
    };
    var AMAZON_TAG = 'brazenprodu01-20';
"""

# Read current main.js
def gh_get(path):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        headers={'Authorization': f'token {GH_TOKEN}'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def gh_put(path, data):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        data=json.dumps(data).encode(),
        headers={'Authorization': f'token {GH_TOKEN}', 'Content-Type': 'application/json'},
        method='PUT')
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

f = gh_get(f'/repos/Brazenproducts/{REPO}/contents/js/main.js')
sha = f['sha']
content = base64.b64decode(f['content']).decode('utf-8')

# Replace the existing vehicleData block + add Amazon fallback handling
# The original block is wrapped in: var vehicleData = { ... };
new_content = re.sub(
    r'    var vehicleData = \{.*?\n    \};(?:.*?\n    \}\n)?',
    EXPANDED_DATA.lstrip('\n'),
    content,
    count=1,
    flags=re.DOTALL
)

# Update the vfBtn click handler to handle amazonQuery fallback
new_content = re.sub(
    r"vfBtn\.addEventListener\('click', function\(\) \{[^}]+?if \(make && model && vehicleData\[make\] && vehicleData\[make\]\[model\]\) \{[^}]+?window\.location\.href = vehicleData\[make\]\[model\]\.page;[^}]+?\} else if \(make\) \{[^}]+?\}[^}]+?\}\);",
    """vfBtn.addEventListener('click', function() {
      var make = vfMake.value;
      var model = vfModel.value;
      if (make && model && vehicleData[make] && vehicleData[make][model]) {
        var v = vehicleData[make][model];
        if (v.page) {
          window.location.href = v.page;
        } else if (v.amazonQuery) {
          window.location.href = 'https://www.amazon.com/s?k=' + encodeURIComponent(v.amazonQuery) + '&tag=' + AMAZON_TAG;
        }
      } else if (make) {
        // Open Amazon search for the make if no model selected
        window.location.href = 'https://www.amazon.com/s?k=' + encodeURIComponent(make + ' seat covers') + '&tag=' + AMAZON_TAG;
      }
    });""",
    new_content,
    count=1,
    flags=re.DOTALL
)

# Sanity check
assert 'Chevrolet' in new_content, "Chevrolet not in new content - replacement failed"
assert "vehicleData = {" in new_content
assert new_content.count("vehicleData = {") == 1, f"Multiple vehicleData blocks: {new_content.count('vehicleData = {')}"

# Push
encoded = base64.b64encode(new_content.encode('utf-8')).decode('ascii')
gh_put(f'/repos/Brazenproducts/{REPO}/contents/js/main.js', {
    'message': 'Expand vehicle finder: add Chevy, GMC, Ram, Dodge, Nissan, Honda, Subaru, Tesla, Rivian; Amazon fallback for models without dedicated pages',
    'content': encoded,
    'sha': sha
})
print(f'SUCCESS - vehicle finder expanded on {REPO}')
print(f'  New makes: 12 (was 3)')
print(f'  Lines: {new_content.count(chr(10))}')
