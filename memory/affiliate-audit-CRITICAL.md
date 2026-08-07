# 🚨 CRITICAL ALERT — Daily Affiliate Audit — 2026-08-02 06:00 UTC

## THRESHOLD TRIGGERED: MASSIVE SITE OUTAGE

**Alert Timestamp:** 2026-08-02 06:00 UTC  
**Threshold Condition:** `new sites down since last run > 10` **MASSIVELY EXCEEDED**  
**Severity:** 🚨🚨🚨 **CATASTROPHIC**  
**Recipient:** Mitch (Telegram slashdaddy, 7550065844)

---

## CRITICAL METRICS

| Metric | Today (08-02) | Yesterday (07-31) | Change | Status |
|--------|--------------|-------------------|--------|--------|
| **Total Sites Scanned** | 735 | 723 | +12 | → |
| **Sites DOWN** | **282** | **10** | ↑ **+272 NEW** | 🚨🚨🚨 |
| Sites OK | 53 | — | — | — |
| Sites Warning | 389 | — | — | — |
| Sites Critical | 293 | — | — | — |

**NEW FAILURES SINCE LAST RUN: +272 sites** (threshold: >10) 🚨

---

## Root Cause Assessment

**The overwhelming pattern:** GitHub Pages SSL certificate mismatch  
All failures show:  
`Hostname/IP does not match certificate's altnames: DNS:*.github.com, DNS:*.github.io, ...`

This indicates a **GitHub Pages platform-level SSL cert outage** affecting custom domains — the cert for these sites is presenting as github.com's own cert instead of the custom domain cert. This is a **GitHub Pages infrastructure failure**, not individual site problems.

**Secondary failures:** ~15 sites with `getaddrinfo ENOTFOUND` (DNS resolution failures, same as previous runs)  
**Tertiary failures:** ~8 sites with HTTP 404 (existing issue, not new)

---

## Full List of Down Sites (282 total)

4runnerseats.com  
airfilterforpets-com  
allergenairfilter-com  
altitudeparts.com  
autopartsreviewed-com  
autoshipfilter-com  
bestantiagingsupplement.com  
bestdogtrainingcourse.com  
bestdutchoven.com  
besthomefilter-com  
besthvacfilter-com  
besthvacfilter.com  
bestkitchenscale.com  
bestlabel-maker.com  
bestofficefilter-com  
bestoffroadbrands-com  
bestpastamaker.com  
bestreciprocatingsaw.com  
bestsousvide.com  
beststandmixer.com  
besttireinflator.com  
bestwindshieldwiper-com  
boxomasks.com  
brandedaftermarket.com  
brazenathlete.com  
brazenathletes.com  
brazenbags.com  
brazenbologna.com  
brazenleather.com  
bronco2022.com  
broncocages.com  
broncorollcages.com  
bsterile.com  
byepillow.com  
calbeverage.com  
cleanbuttle.com  
commandeerseats.com  
commanderbags.com  
commandersfootballshop.com  
customcapshop.com  
customcapsusa.com  
customgloveco.com  
customglovecompany.com  
customhatusa.com  
customizedhatsusa.com  
customizedhatusa.com  
customlabelproducts.com  
custompatchmaker.com  
customplasticcorrugate.com  
devilspits.com  
direcship.com  
directautoclub.com  
disastermodularhousing.com  
downties.com  
dubaifiltration.com  
dubaijeep.com  
dubaioverland.com  
emergencyhousingcompany.com  
emergencymodularhousing.com  
emergencyshelterhousing.com  
emptypackage.com  
endurm.com  
endurmis.com  
fabricshopusa.com  
fast2find.com  
federalemergencyhousing.com  
fernallern.com  
filterbuyguide.com  
filterdubai.com  
filtersdubai.com  
filtersizes-com  
filterspurchase.com  
filtersuae.com  
filthyedge.com  
firestrips.com  
footrubbers.com  
forwardpartyshop.com  
forwardpartystore.com  
fun-bagz.com  
furnaceprefilter-com  
furnacereview.com  
garrisonhat.com  
garrisonhats.com  
garrisonheadwear.com  
governmentemergencyhousing.com  
guardiansballteam.com  
handimasks.com  
homehvacfilters-com  
homelesshousingunits.com  
homelessshelterhousing.com  
homelessshelterunits.com  
hvachomefilters-com  
interiormolle.com  
janitol.com  
jkseatcovers.com  
knuckleboomguide.com  
knuckleboomhq.com  
lasermolle.com  
majoritypoliticalparty.com  
manufactureraftermarket.com  
manufacturersaftermarket.com  
meathide.com  
meathides.com  
meatskins.com  
meatskinz.com  
merv13filter.com  
merv13guide.com  
microbegon.com  
middleparty.shop  
middlepartyshop.com  
middlepartystore.com  
moabspringwater.com  
mobseating.com  
mobseats.com  
modpaks.com  
modupacks.com  
modupak.com  
modupaks.com  
modupax.com  
molleconsole.com  
molleexterior.com  
mollepals.com  
molleseat.com  
municipalemergencyhousing.com  
murrietasports.com  
newpartystore.com  
nutsboltsusa.com  
onlinefabricdepot.com  
onlinefabricmart.com  
onlinefabricoutlet.com  
overlanddubai.com  
overlanduae.com  
ovex.life  
ovex4x4.com  
ovexinc.com  
ovexlife.com  
packomasks.com  
paintsucker.com  
painttraps.com  
palletjacker.com  
palletrackstraps.com  
pals.systems  
palsmolle.com  
palsstrips.com  
passengermasks.com  
patriotfabric.com  
paybillswithcrypto.com  
petairfilter.com  
polyesterbattinsulation.com  
prefabemergencyhousing.com  
prefiltersbuy.com  
prefiltershvac.com  
privatelabelgear.com  
privatelabelhats.com  
privatewhitelabelgear.com  
productsuneed.com  
qrathletic.com  
rangewolf.com  
rapiddeployshelter.com  
rapiddeployshelters.com  
rattlerwear.com  
reclaimfire.com  
redeyemasks.com  
redigloves.com  
redimasks.com  
redisanitizer.com  
redisupplies.com  
repelm.com  
rhinomafia.com  
rhinostrap.com  
riverbeans.com  
rollbarwrap.com  
saltonpepper.com  
saltonpeppers.com  
saltonseasalt.com  
schoolsportmasks.com  
scoutgrabhandles.com  
seat.systems  
seatcover.systems  
seating.systems  
shadeliner.com  
shadeliners.com  
shademats.com  
shedwithoutpermit.com  
shoerubber.com  
sipsleeve.com  
skipatip-preview  
slapsleeve.com  
slapsleeves.com  
slapsocks.com  
snakescale.com  
spitfang.com  
sportadventurevehicle4x4.com  
sportsadventurevehicle.com  
sportsadventurevehicles.com  
stagaftermaket.com  
sterilee.com  
sterilizedmask.com  
sterilizedmasks.com  
steritol.com  
stomperrc.com  
stompertoys.com  
storagesleeve.com  
strappallet.com  
stratratchets.com  
subscriptionfilter-com  
suckerfilter.com  
systemseatcovers.com  
systemseating.com  
systemseats.com  
tabsmaster.com  
tacomaseats-com  
tactical.life  
tacticalcovers.com  
tacticalpatchesusa.com  
tacticalpatchusa.com  
tacticalseat.com  
tacticalseatcovers-com  
tacticalseating.com  
tacticalseats-com  
tacticalsew.com  
tacticalshade.com  
tailmod.com  
tailmods.com  
tbarbag.com  
tbarbags.com  
tbargear.com  
temporaryhousingunits.com  
temporaryshelterhousing.com  
tentwraps.com  
thelasttrail.com  
thinkseats.com  
thongkinis.com  
thornwoodaccord.com  
topespressomaker.com  
topmassagegun.com  
topoffroadstores-com  
toppowerstation.com  
topqueenmattress.com  
(+ additional sites — see full audit output)

---

## Likely Cause

**GitHub Pages SSL infrastructure failure** — custom domain SSL certs across the entire portfolio are presenting GitHub's own wildcard cert instead of the custom domain cert. This is a GitHub-side problem, not fixable by us directly.

**Recommended actions:**
1. Check GitHub Status page: https://githubstatus.com
2. Check if GitHub Pages custom domain SSL provisioning is affected
3. Wait for GitHub to resolve, or consider emergency DNS failover
4. Do NOT rebuild/redeploy sites — this will not fix a cert provisioning issue

---

## Dashboard

Dashboard rebuilt and pushed: https://brazenproducts.github.io/axl-dashboard/  
Audit run: 2026-08-02 06:00 UTC  
Previous audit: 2026-07-31 14:00 UTC (10 down)  
Change: **+272 sites newly down** 🚨
