#!/usr/bin/env python3
"""
Affiliate Site Comprehensive Audit & Repair Script

This script now logs explicit per-site checks required by Mitch:
- homepage photos/buttons present
- homepage buttons point to the correct product target pattern
- Amazon disclaimer present
- affiliate tag valid
- HTTPS canonical / destination links valid
- secondary pages also have photos/buttons when affiliate links exist
- Bartact links must go to Bartact.com directly
- problems encountered + fixes applied + verification status
- dashboard update requirement recorded in output payload
"""

import json
import os
import re
import glob
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from collections import Counter
from bs4 import BeautifulSoup

WORKSPACE = Path('/home/ubuntu/.openclaw/workspace')
SITES_DIR = WORKSPACE / 'sites'
REPORT_PATH = WORKSPACE / 'memory' / 'affiliate-audit-latest.json'
LOG_PATH = WORKSPACE / 'memory' / 'affiliate-audit-fix-log.json'
DASHBOARD_URL = 'https://brazenproducts.github.io/axl-dashboard/'
AFFILIATE_TAG_RE = re.compile(r'brazenprodu01-20-[a-z0-9-]+-20')
AMAZON_DISCLOSURE_PATTERNS = [
    'amazon affiliate',
    'amazon associate',
    'as an amazon associate',
]
SKIP_PAGES = {
    'index.html', 'about.html', 'contact.html', 'privacy.html',
    'buyers-guide.html', 'buying-guide.html', 'terms.html', 'thanks.html'
}


def read_text(path: Path) -> str:
    return path.read_text(errors='ignore')


def write_text(path: Path, text: str):
    path.write_text(text)


class Auditor:
    def __init__(self):
        self.site_logs = []
        self.summary = Counter()

    def audit_link(self, href: str):
        parsed = urlparse(href)
        tag = parse_qs(parsed.query).get('tag', [''])[0]
        return {
            'href': href,
            'is_https': href.startswith('https://'),
            'is_amazon': 'amazon.' in href,
            'is_bartact': 'bartact.com' in href,
            'affiliate_tag': tag,
            'affiliate_tag_valid': (not ('amazon.' in href)) or bool(AFFILIATE_TAG_RE.fullmatch(tag)),
            'looks_like_product_target': ('/dp/' in href) or ('bartact.com' in href),
        }

    def add_amazon_disclaimer_if_missing(self, html: str):
        low = html.lower()
        if 'brazenprodu01-20' in html and not any(p in low for p in AMAZON_DISCLOSURE_PATTERNS):
            disclaimer = '<p class="amazon-disclaimer" style="margin-top:12px;color:#888;font-size:.85em;">As an Amazon Associate, we may earn from qualifying purchases.</p>'
            if '</footer>' in html:
                return html.replace('</footer>', disclaimer + '</footer>', 1), True
            if '</body>' in html:
                return html.replace('</body>', disclaimer + '</body>', 1), True
        return html, False

    def force_https_canonical(self, html: str):
        updated = re.sub(r'(<link[^>]+rel=["\']canonical["\'][^>]+href=["\'])http://', r'\1https://', html, flags=re.I)
        updated = updated.replace('content="http://', 'content="https://')
        return updated, updated != html

    def inject_secondary_image_if_missing(self, site_dir: Path, file_path: Path, html: str):
        soup = BeautifulSoup(html, 'html.parser')
        links = [a for a in soup.find_all('a', href=True) if ('amazon.' in a['href'] or 'bartact.com' in a['href'])]
        imgs = soup.find_all('img')
        if not links or imgs:
            return html, False
        index_path = site_dir / 'index.html'
        if not index_path.exists():
            return html, False
        index_soup = BeautifulSoup(read_text(index_path), 'html.parser')
        first = index_soup.find('img')
        if not first or not first.get('src'):
            return html, False
        snippet = f'<div class="article-product-image" style="text-align:center;margin:24px 0;"><img src="{first.get("src")}" alt="{first.get("alt", "Product image")}" loading="lazy" style="max-width:320px;width:100%;height:auto;border-radius:8px;"></div>'
        for anchor in ('</main>', '</article>', '</body>'):
            if anchor in html:
                return html.replace(anchor, snippet + anchor, 1), True
        return html, False

    def audit_site(self, site_dir: Path):
        index_path = site_dir / 'index.html'
        if not index_path.exists():
            return None

        site = site_dir.name
        fixes = []
        problems = []
        verifications = []

        index_html = read_text(index_path)
        updated = index_html

        updated, changed = self.add_amazon_disclaimer_if_missing(updated)
        if changed:
            fixes.append('added_amazon_disclaimer')

        updated, changed = self.force_https_canonical(updated)
        if changed:
            fixes.append('forced_https_canonical_and_meta')

        if updated != index_html:
            write_text(index_path, updated)
            index_html = updated

        soup = BeautifulSoup(index_html, 'html.parser')
        canonical = soup.find('link', rel=lambda v: v and 'canonical' in v)
        canonical_href = canonical.get('href', '') if canonical else ''
        all_imgs = [img for img in soup.find_all('img') if img.get('src')]
        all_aff_links = [a for a in soup.find_all('a', href=True) if ('amazon.' in a['href'] or 'bartact.com' in a['href'])]
        audited_links = [self.audit_link(a['href']) for a in all_aff_links]

        home_has_photos = bool(all_imgs)
        home_has_buttons = bool(all_aff_links)
        home_buttons_match_products = all(l['looks_like_product_target'] for l in audited_links) if audited_links else False
        amazon_disclaimer_present = any(p in index_html.lower() for p in AMAZON_DISCLOSURE_PATTERNS)
        affiliate_tag_valid = all(l['affiliate_tag_valid'] for l in audited_links if l['is_amazon'])
        https_site_ok = canonical_href.startswith('https://')
        https_links_ok = all(l['is_https'] for l in audited_links)
        bartact_links_direct = all((not l['is_amazon']) for l in audited_links if l['is_bartact'])

        for name, ok in [
            ('home_has_photos', home_has_photos),
            ('home_has_buttons', home_has_buttons),
            ('home_buttons_match_products', home_buttons_match_products),
            ('amazon_disclaimer_present', amazon_disclaimer_present),
            ('affiliate_tag_valid', affiliate_tag_valid),
            ('https_site_ok', https_site_ok),
            ('https_links_ok', https_links_ok),
            ('bartact_links_direct', bartact_links_direct),
        ]:
            verifications.append({'check': name, 'ok': ok})
            if not ok:
                problems.append(name)

        secondary_logs = []
        for page in sorted(site_dir.glob('*.html')):
            if page.name in SKIP_PAGES:
                continue
            html = read_text(page)
            fixed_html, changed = self.inject_secondary_image_if_missing(site_dir, page, html)
            if changed:
                write_text(page, fixed_html)
                fixes.append(f'secondary_image_injected:{page.name}')
                html = fixed_html
            sp = BeautifulSoup(html, 'html.parser')
            page_imgs = [img for img in sp.find_all('img') if img.get('src')]
            page_links = [a for a in sp.find_all('a', href=True) if ('amazon.' in a['href'] or 'bartact.com' in a['href'])]
            page_audited = [self.audit_link(a['href']) for a in page_links]
            page_ok = True
            page_problems = []
            if page_links and not page_imgs:
                page_ok = False
                page_problems.append('links_no_images')
            if any(not l['is_https'] for l in page_audited):
                page_ok = False
                page_problems.append('http_link')
            if any(l['is_amazon'] and not l['affiliate_tag_valid'] for l in page_audited):
                page_ok = False
                page_problems.append('bad_affiliate_tag')
            if any(not l['looks_like_product_target'] for l in page_audited):
                page_ok = False
                page_problems.append('non_product_target_link')
            secondary_logs.append({
                'page': page.name,
                'has_images': bool(page_imgs),
                'has_buttons': bool(page_links),
                'buttons_match_products': not any(not l['looks_like_product_target'] for l in page_audited),
                'https_links_ok': not any(not l['is_https'] for l in page_audited),
                'affiliate_tag_valid': not any(l['is_amazon'] and not l['affiliate_tag_valid'] for l in page_audited),
                'ok': page_ok,
                'problems': page_problems,
            })
            if not page_ok:
                problems.append(f'secondary:{page.name}:{"|".join(page_problems)}')

        secondary_pages_checked = len(secondary_logs)
        secondary_pages_match_products = all(p['buttons_match_products'] for p in secondary_logs) if secondary_logs else True
        if not secondary_pages_match_products:
            verifications.append({'check': 'secondary_pages_match_products', 'ok': False})
        else:
            verifications.append({'check': 'secondary_pages_match_products', 'ok': True})

        overall_pass = all(v['ok'] for v in verifications) and all(p['ok'] for p in secondary_logs)
        if overall_pass:
            self.summary['passes'] += 1
        else:
            self.summary['fails'] += 1

        site_log = {
            'site': site,
            'dashboard_url': DASHBOARD_URL,
            'checks': {
                'home_has_photos': home_has_photos,
                'home_has_buttons': home_has_buttons,
                'home_buttons_match_products': home_buttons_match_products,
                'amazon_disclaimer_present': amazon_disclaimer_present,
                'affiliate_tag_valid': affiliate_tag_valid,
                'https_site_ok': https_site_ok,
                'https_links_ok': https_links_ok,
                'bartact_links_direct': bartact_links_direct,
                'secondary_pages_checked': secondary_pages_checked,
                'secondary_pages_match_products': secondary_pages_match_products,
                'dashboard_update_required': True,
            },
            'problems_encountered': problems,
            'fixes_applied': fixes,
            'verification': verifications,
            'secondary_pages': secondary_logs,
            'overall_pass': overall_pass,
        }
        self.site_logs.append(site_log)
        return site_log

    def run(self):
        for site_dir in sorted(SITES_DIR.iterdir()):
            if site_dir.is_dir():
                self.audit_site(site_dir)

        report = {
            'dashboard_url': DASHBOARD_URL,
            'total_sites': len(self.site_logs),
            'passes': self.summary['passes'],
            'fails': self.summary['fails'],
            'sites': self.site_logs,
        }
        LOG_PATH.write_text(json.dumps(report, indent=2))

        condensed = {
            'dashboard_url': DASHBOARD_URL,
            'total_sites': len(self.site_logs),
            'passes': self.summary['passes'],
            'fails': self.summary['fails'],
            'sites': [s for s in self.site_logs if not s['overall_pass']],
        }
        REPORT_PATH.write_text(json.dumps(condensed, indent=2))
        print(json.dumps({'total_sites': len(self.site_logs), 'passes': self.summary['passes'], 'fails': self.summary['fails']}, indent=2))


if __name__ == '__main__':
    Auditor().run()
