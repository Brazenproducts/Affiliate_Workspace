# 🚨 CRITICAL ALERT — Daily Affiliate Audit — 2026-08-13 06:00 UTC

## THRESHOLD TRIGGERED: MASSIVE SITE OUTAGE

**Alert Timestamp:** 2026-08-13 06:00 UTC  
**Threshold Condition:** `new sites down since last run > 10` **MASSIVELY EXCEEDED**  
**Severity:** 🚨🚨🚨 **CATASTROPHIC**  
**Recipient:** Mitch (Telegram slashdaddy, 7550065844)

---

## CRITICAL METRICS

| Metric | Today (08-13) | Yesterday (08-12) | Change | Status |
|--------|--------------|-------------------|--------|--------|
| **Total Sites Scanned** | 738 | 738 | 0 | → |
| **Sites DOWN** | **267** | **0 (localOnly, no live check)** | ↑ **+267 NEW** | 🚨🚨🚨 |
| Sites OK | 49 | 135 | -86 | ↓ |
| Sites Warning | 295 | 432 | -137 | ↓ |
| Sites Critical | 383 | 160 | **+223** | 🚨 |

**NEW FAILURES SINCE LAST RUN: 267 sites with "site down" detected** (threshold: >10) 🚨

Note: Yesterday's audit (08-12) was `localOnly: true` — it did not do live HTTP checks. Today's audit performed full live checks and detected 267 sites actively down.

---

## Root Cause Assessment

**Overwhelming pattern:** GitHub Pages SSL certificate mismatch  
Most failures show:
`Hostname/IP does not match certificate's altnames: DNS:*.github.com, DNS:*.github.io, ...`

This indicates a **GitHub Pages platform-level SSL cert outage** affecting custom domains — certs are presenting as GitHub's own wildcard cert instead of the per-domain cert.

**Secondary failures:** ~15 sites with `getaddrinfo ENOTFOUND` (DNS failures)  
**Tertiary failures:** ~10 sites with HTTP 404 or 302

---

## Full List of 267 Down Sites

1. 4runnerseats.com
2. airfilterforpets-com
3. allergenairfilter-com
4. altitudeparts.com
5. autopartsreviewed-com
6. autoshipfilter-com
7. bestantiagingsupplement.com
8. bestdogtrainingcourse.com
9. bestdutchoven.com
10. besthomefilter-com
11. besthvacfilter-com
12. besthvacfilter.com
13. bestkitchenscale.com
14. bestofficefilter-com
15. bestoffroadbrands-com
16. bestpastamaker.com
17. bestreciprocatingsaw.com
18. bestsousvide.com
19. beststandmixer.com
20. besttireinflator.com
21. bestweightedvest.com
22. bestwindshieldwiper-com
23. boxomasks.com
24. brandedaftermarket.com
25. brazenathlete.com
26. brazenathletes.com
27. brazenbags.com
28. brazenbologna.com
29. brazenleather.com
30. bronco2022.com
31. broncocages.com
32. broncorollcages.com
33. bsterile.com
34. byepillow.com
35. calbeverage.com
36. cleanbuttle.com
37. commandeerseats.com
38. commanderbags.com
39. commandersfootballshop.com
40. customcapshop.com
41. customcapsusa.com
42. customgloveco.com
43. customglovecompany.com
44. customhatusa.com
45. customizedhatusa.com
46. customlabelproducts.com
47. custompatchmaker.com
48. devilspits.com
49. direcship.com
50. directautoclub.com
51. disastermodularhousing.com
52. downties.com
53. dubaifiltration.com
54. dubaioverland.com
55. emergencyhousingcompany.com
56. emergencymodularhousing.com
57. emergencyshelterhousing.com
58. emptypackage.com
59. endurm.com
60. endurmis.com
61. fabricshopusa.com
62. fast2find.com
63. federalemergencyhousing.com
64. filterbuyguide.com
65. filterdubai.com
66. filtersdubai.com
67. filtersizes-com
68. filterspurchase.com
69. filtersuae.com
70. filthyedge.com
71. firestrips.com
72. footrubbers.com
73. forwardpartyshop.com
74. forwardpartystore.com
75. fun-bagz.com
76. furnaceprefilter-com
77. furnacereview.com
78. garrisonhat.com
79. garrisonhats.com
80. garrisonheadwear.com
81. governmentemergencyhousing.com
82. guardiansballteam.com
83. handimasks.com
84. homehvacfilters-com
85. homelesshousingunits.com
86. homelessshelterhousing.com
87. homelessshelterunits.com
88. hvachomefilters-com
89. indexing-credentials
90. interiormolle.com
91. janitol.com
92. knuckleboomguide.com
93. knuckleboomhq.com
94. lasermolle.com
95. majoritypoliticalparty.com
96. manufactureraftermarket.com
97. manufacturersaftermarket.com
98. meathide.com
99. meathides.com
100. meatskins.com
101. meatskinz.com
102. merv13filter.com
103. merv13guide.com
104. microbegon.com
105. middleparty.shop
106. middlepartyshop.com
107. middlepartystore.com
108. moabspringwater.com
109. mobseating.com
110. mobseats.com
111. modpaks.com
112. modupacks.com
113. modupak.com
114. modupaks.com
115. modupax.com
116. molleconsole.com
117. molleexterior.com
118. mollepals.com
119. molleseat.com
120. municipalemergencyhousing.com
121. murrietasports.com
122. newpartystore.com
123. nutsboltsusa.com
124. onlinefabricdepot.com
125. onlinefabricmart.com
126. onlinefabricoutlet.com
127. overlanddubai.com
128. overlanduae.com
129. ovex.life
130. ovex4x4.com
131. ovexinc.com
132. ovexlife.com
133. packomasks.com
134. paintsucker.com
135. painttraps.com
136. palletjacker.com
137. palletrackstraps.com
138. pals.systems
139. palsmolle.com
140. palsstrips.com
141. passengermasks.com
142. patriotfabric.com
143. paybillswithcrypto.com
144. petairfilter.com
145. polyesterbattinsulation.com
146. prefabemergencyhousing.com
147. prefiltersbuy.com
148. prefiltershvac.com
149. privatelabelgear.com
150. privatelabelhats.com
151. privatewhitelabelgear.com
152. productsuneed.com
153. qrathletic.com
154. rangewolf.com
155. rapiddeployshelter.com
156. rapiddeployshelters.com
157. rattlerwear.com
158. reclaimfire.com
159. redeyemasks.com
160. redigloves.com
161. redimasks.com
162. redisanitizer.com
163. redisupplies.com
164. repelm.com
165. rhinomafia.com
166. rhinostrap.com
167. riverbeans.com
168. rollbarwrap.com
169. saltonpepper.com
170. saltonpeppers.com
171. saltonseasalt.com
172. schoolsportmasks.com
173. scoutgrabhandles.com
174. seat.systems
175. seatcover.systems
176. seating.systems
177. shadeliner.com
178. shadeliners.com
179. shademats.com
180. shoerubber.com
181. sipsleeve.com
182. skipatip-preview
183. slapsleeve.com
184. slapsleeves.com
185. slapsocks.com
186. snakescale.com
187. spitfang.com
188. sportadventurevehicle4x4.com
189. sportsadventurevehicle.com
190. sportsadventurevehicles.com
191. stagaftermaket.com
192. sterilee.com
193. sterilizedmask.com
194. sterilizedmasks.com
195. steritol.com
196. stomperrc.com
197. stompertoys.com
198. storagesleeve.com
199. strappallet.com
200. subscriptionfilter-com
201. suckerfilter.com
202. systemseatcovers.com
203. systemseating.com
204. systemseats.com
205. tabsmaster.com
206. tacomaseats-com
207. tactical.life
208. tacticalcovers.com
209. tacticalpatchesusa.com
210. tacticalpatchusa.com
211. tacticalseat.com
212. tacticalseatcovers-com
213. tacticalseating.com
214. tacticalseats-com
215. tacticalsew.com
216. tacticalshade.com
217. tailmod.com
218. tailmods.com
219. tbarbag.com
220. tbarbags.com
221. tbargear.com
222. temporaryhousingunits.com
223. temporaryshelterhousing.com
224. tentwraps.com
225. thelasttrail.com
226. thinkseats.com
227. thongkinis.com
228. topespressomaker.com
229. topmassagegun.com
230. topoffroadstores-com
231. tortoisecase.com
232. tortoisecases.com
233. tortoisecontainers.com
234. tortoisesystems.com
235. tossrus.com
236. trailgates.com
237. trailmod.com
238. treesock.com
239. trekmask.com
240. trekmasks.com
241. truckarmour.com
242. tsseat.com
243. uaefiltration.com
244. uaejeep.com
245. uaeoverland.com
246. uglymaskcontest.com
247. under120shed.com
248. unsoilet.com
249. usafabricoutlet.com
250. utvaccessory.com
251. utvgod.com
252. valvestemcapsusa.com
253. varioususa.com
254. veteranemergencyhousing.com
255. war-gear.com
256. wartact.com
257. waxmeoff.com
258. whatsizehvacfilter-com
259. whatsizehvacfilter.com
260. wholehouseairfilter-com
261. wholehouseairfilter.com
262. windshieldwiperusa.com
263. winetrailtour.com
264. wipedo.com
265. wranglermagneto.com
266. x3bags.com
267. zerilize.com

---

## Likely Cause

**GitHub Pages SSL infrastructure failure** — custom domain SSL certs presenting GitHub's own wildcard cert instead of the custom domain cert. This is a GitHub-side problem.

**Recommended actions:**
1. Check GitHub Status: https://githubstatus.com
2. Check if GitHub Pages custom domain SSL provisioning is affected
3. Wait for GitHub to resolve — do NOT redeploy (won't fix cert provisioning)
4. Monitor: check again in 2-4 hours

---

## Dashboard

Dashboard rebuilt and pushed: https://brazenproducts.github.io/axl-dashboard/  
Audit run: 2026-08-13 06:00 UTC  
Previous audit: 2026-08-12 (localOnly, no live checks)  
Live sites down today: **267** 🚨
