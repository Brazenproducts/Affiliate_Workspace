# Affiliate Domain Search Console Setup

## Blocker
Automated verification is blocked because Google Site Verification API is not enabled on GCP project `351767043397`.

Enable here:
`https://console.developers.google.com/apis/api/siteverification.googleapis.com/overview?project=351767043397`

If Mitch does not want to enable that API, do this manually in Search Console.

## Manual Verification Steps
1. Open Google Search Console.
2. Click `Add property`.
3. Choose `Domain`.
4. Enter the root domain exactly as shown below.
5. Google will give a DNS TXT record token.
6. Add that TXT record at GoDaddy for the root domain.
7. Wait a few minutes.
8. Click `Verify`.
9. After verification, submit `https://DOMAIN/sitemap.xml`.
10. Add the service account below as `Owner` if Google allows delegated access for that property.

Service account to add:
`axl-348@proud-stage-397621.iam.gserviceaccount.com`

## Domains To Add
- `whatarebest.com`
- `limitstraps.com`
- `bestseatcover.com`
- `bestbroncoaccessories.com`
- `besttruckaccessories.com`
- `besttonneaucovers.com`
- `bestcordlesstools.com`
- `bestfirestick.com`
- `jeepseatcover.com`
- `petwearhouse.com`
- `bestinstantpot.com`
- `bestsmokergrill.com`
- `bestmeshwifi.com`
- `bestgarageorganizer.com`

## Notes
- Prefer `Domain` properties, not URL-prefix properties.
- DNS is managed in GoDaddy.
- GitHub Pages and HTTPS status do not block property creation; DNS ownership is what matters.
- After verification, sitemap URL pattern is always: `https://DOMAIN/sitemap.xml`
