# Gainora — manuel accepttest (kun syntetiske data)

Dato: ______  Tester: ______  Miljø/URL: ______  Commit/deployment: ______

**Stopregel:** Brug aldrig virkelige kunders navne, regnskaber, CSV/XLSX, følsomme noter eller produktionsdata. REAL_CUSTOMER_DATA_READY skal forblive false. Filimport er bevidst lukket. En vellykket browserdemo er ikke en GDPR-godkendelse.

## Forudsætninger
- [ ] Bekræft at staging-URL er den tilsigtede og at seneste deployment svarer til dokumenteret commit.
- [ ] GitHub CI: PostgreSQL-regression, audit, typecheck, npm test og build grønne (indsæt run-link: ______).
- [ ] Bekræft migrationer anvendt i staging; stop hvis de mangler.
- [ ] Opret/brug kun syntetisk testorganisation, uden person- eller kundedata.

## Browserforløb
- [ ] Åbn login uden at være logget ind; beskyttede sider skal kræve login.
- [ ] Prøv login med testkonto; noter fejltekst uden at dele kodeord eller tokens.
- [ ] Test 'Glemt adgangskode' med en testmail, modtag link og log ind med ny adgangskode. Hvis funktionen ikke findes eller mail udebliver: FEJL.
- [ ] Opret/vælg syntetisk testorganisation med korrekt ejer/medlemskab.
- [ ] Start den faste demo (8 fiktive september-2026-poster) via UI, hvis tilgængelig. Hvis UI ikke findes: notér BLOKERET, ikke BESTÅET.
- [ ] Kontrollér DKK 200.000 omsætning, DKK 164.000 omkostninger, DKK 36.000 resultat i demoens totaler.
- [ ] Gennemgå Profit Audit-fund: forklaring, datagrundlag, periode, DKK/måned vs. DKK/år; skøn må ikke fremstå som dokumenteret besparelse.
- [ ] Godkend et syntetisk fund og registrér syntetisk resultat; genindlæs og kontrollér at status og historik bevares.
- [ ] Kør demo/analyse igen; kontrollér at der ikke opstår dubletter eller tab af godkendelser.

## Negative tests
- [ ] Forsøg CSV/XLSX-upload og import-preview/commit: skal afvises (ikke kun skjules i UI).
- [ ] Log ud og forsøg direkte adgang til beskyttede URL'er: afvises.
- [ ] Hvis der findes to syntetiske organisationer og testroller: verificér at org A ikke kan læse/ændre org B's data.
- [ ] Kontrollér at visning og API ikke afslører service keys, tokens eller andre hemmeligheder.

## Dokumentation og beslutning
For hver fejl: trin, forventet resultat, faktisk resultat, skærmbillede uden persondata, tidspunkt, browser og URL. Opret issue i GitHub. Angiv hver test som BESTÅET / FEJL / BLOKERET / IKKE KØRT.

- CI: ______  Login/reset: ______  Demo: ______  Audit: ______  Tenant-isolation: ______
- Kritiske fejl: ______  Links til issues: ______
- Browseraccept: ______ (bestået / ikke bestået)
- **REAL_CUSTOMER_DATA_READY: false** — kræver separat dokumenteret privacy-, sikkerheds- og leverandørgodkendelse.
