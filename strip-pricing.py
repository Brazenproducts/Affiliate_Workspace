#!/usr/bin/env python3
"""Remove all fake pricing from every HTML file across all 28 elipacko affiliate sites.
Strategy: remove entire table rows/sections containing dollar amounts for Elipacko pricing,
and replace pricing paragraphs with "contact for quote" language."""

import os, re

BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"

# Patterns that indicate fake Elipacko pricing to REMOVE entirely
# These are table rows or paragraphs quoting specific dollar amounts for Elipacko products
REMOVE_PATTERNS = [
    # Full pricing table rows with dollar amounts
    re.compile(r'<tr[^>]*>.*?Elipacko Direct.*?\$[0-9].*?</tr>', re.DOTALL),
    re.compile(r'<tr[^>]*>.*?\$[0-9][0-9].*?Elipacko.*?</tr>', re.DOTALL),
    # Paragraphs explicitly quoting Elipacko prices
    re.compile(r'<p[^>]*>[^<]*(?:Elipacko[^<]*(?:pricing|direct|factory)[^<]*\$[0-9]|\$[0-9][^<]*Elipacko[^<]*(?:pricing|direct|factory))[^<]*</p>', re.DOTALL | re.IGNORECASE),
    # Full pricing table sections (tables with US Distributor / Elipacko Direct columns)
    re.compile(r'<table[^>]*>.*?(?:US Distributor|Elipacko Direct).*?</table>', re.DOTALL),
    # Sentences quoting Elipacko factory-direct prices
    re.compile(r'Elipacko factory.direct pricing[^<.]*\$[0-9][^<.]*\.', re.IGNORECASE),
    re.compile(r'Elipacko[^<.]*\$[0-9][0-9][^<.]*per unit[^<.]*\.', re.IGNORECASE),
    re.compile(r'factory.direct pricing[^<.]*\$[0-9][^<.]*\.', re.IGNORECASE),
]

# Replacement for pricing paragraphs
QUOTE_CTA = '<p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Pricing is available on request — contact <a href="https://elipacko.com" style="color:#1a6bdb">Elipacko directly</a> for a factory-direct quote based on your quantity, size, and specification requirements.</p>'

fixed_files = 0
fixed_instances = 0

for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for fname in files:
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        count = 0

        # Remove entire pricing tables (US Distributor / Elipacko Direct)
        table_pattern = re.compile(
            r'<table[^>]*>(?:(?!<table).)*?(?:US Distributor|Elipacko Direct|Elipacko direct)(?:(?!<table).)*?</table>',
            re.DOTALL | re.IGNORECASE
        )
        new_content, n = table_pattern.subn('', content)
        count += n
        content = new_content

        # Remove paragraphs quoting Elipacko prices
        para_pattern = re.compile(
            r'<p[^>]*>[^<]*(?:Elipacko[^<]*\$[0-9]|\$[0-9][^<]*Elipacko)[^<]*</p>',
            re.DOTALL | re.IGNORECASE
        )
        new_content, n = para_pattern.subn(QUOTE_CTA, content)
        count += n
        content = new_content

        # Remove inline sentences with Elipacko + price
        inline_pattern = re.compile(
            r'(?:Elipacko[^<.]*?\$[0-9][0-9][^<.]*?\.)|(?:\$[0-9][0-9][^<.]*?Elipacko[^<.]*?\.)',
            re.IGNORECASE
        )
        new_content, n = inline_pattern.subn('Contact Elipacko for pricing.', content)
        count += n
        content = new_content

        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_files += 1
            fixed_instances += count
            rel = os.path.relpath(fpath, BASE)
            print(f"  {count} fixes: {rel}")

print(f"\nTotal: {fixed_instances} pricing instances removed from {fixed_files} files")
