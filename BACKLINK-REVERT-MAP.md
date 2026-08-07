# Backlink Revert Map — Affiliate Sites → Elipacko

## Current State (as of 2026-08-04)
All affiliate site links have been **temporarily changed to `https://elipacko.com/`** (homepage)
because the deep-link subpages on elipacko.com don't exist yet.

## When elipacko-usa.com Goes Live — Change These Back

Run `fix-backlinks-restore.py` to restore all deep links to the correct pages.

The target should be **`https://elipacko-usa.com/`** for the domain + the specific subpage.

### Link Restoration Map

| Current (temp) | Restore to | Context / which sites |
|---|---|---|
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/agriculture-packaging/` | All 15 affiliate sites (116 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-gaylord-boxes/` | All 15 affiliate sites (112 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-poultry-boxes/` | Poultry sites (79 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-pallets/` | Pallet sites (46 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-corrugated-boxes/` | Box sites (42 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-corrugated-sheets/` | Sheet sites (19 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-containers/` | Container sites (15 instances) |
| `https://elipacko.com/` (deep-link instances) | `https://elipacko-usa.com/pp-meat-lugs/` | Meat lug sites (13 instances) |

## Note on the Build Script
The original deep links are defined in:
`/home/ubuntu/.openclaw/workspace/build-elipacko-affiliates.py`

When elipacko-usa.com is live, update that script to use `elipacko-usa.com` as the
destination domain for all subpage deep links, then rebuild and push all 15 sites.

The simplest restore: in `build-elipacko-affiliates.py`, change:
```
DEST_DOMAIN = "https://elipacko.com"
```
to:
```
DEST_DOMAIN = "https://elipacko-usa.com"
```
...and re-run the build script to regenerate all pages with correct deep links.
Or run `fix-backlinks-restore.py` (see below) for a targeted find-replace without full rebuild.

## Restore Script (run when elipacko-usa.com is live)
Script location: `/home/ubuntu/.openclaw/workspace/fix-backlinks-restore.py`
(Will be created when needed — does a targeted domain swap on all 15 site repos)
