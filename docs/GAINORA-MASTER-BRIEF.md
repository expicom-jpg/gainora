# Gainora — Master Brief

Status pr. 8. oktober 2026. Baseline: `main` ved `ad24bdc928b2ea903cc09f6669944a7b024e24b6`.

Dette er et operationelt overblik, ikke en produktionsgodkendelse, juridisk vurdering eller dokumentation for betalende kunder. Repositoriet er offentligt. Personlige forhandlingsvilkår og fortrolige driftsoplysninger gentages derfor ikke her; de relevante eksisterende kilder identificeres præcist.

## Evidens og afgrænsning

| Mærke | Betydning |
|---|---|
| BESLUTTET | Udtrykkelig ramme i ejerens handover 8. oktober; historiske beslutninger markeres særskilt |
| KODE | Implementering findes i den kontrollerede main-version; er ikke automatisk ende-til-ende-verificeret |
| TESTET | Angiven test eller CI er faktisk kontrolleret; rækkevidden angives |
| FORSLAG | Ikke godkendt aftale, budget eller finansiering |
| DOKUMENTATION | Beskrevet mål/specifikation; ingen påstand om implementering |
| UVERIFICERET | Utilstrækkelig adgang eller dokumentation |

Undersøgelsen omfatter repository-inventar (85 tracked filer), main-historik (17 commits), branch-inventar (29 remote branches, ekskl. HEAD), 188 commits tilgængelige på tværs af branches, kodegennemgang af kritiske API-/auth-/import-/analyse-/SQL-flow, dokumentation og ændringer i åbne strategi-PR'er. Alle 28 PR'er #6–#33 er statuskontrolleret, inklusive CI ved hver aktuel PR-head. Issues #1–#5 er læst. Dette er ikke en fuld sikkerhedsrevision eller test af alle browserforløb.

Historikværktøjet gav søgbare uddrag og opsummeringer af tidligere samtaler, ikke komplette transskripter. RevenuePilot, Pænt Betalt, Polsia, Gainora 2.0 og den kommercielle udvikling blev dækket. Historiske assistentpåstande er ikke behandlet som ny testdokumentation. Polsia-miljøet, oprindelige mails og tidligere vedhæftede build-pakker er ikke genlæst direkte. Nyere kode/live-observationer går forud for gamle statusbeskrivelser.

## 1. Vision og forretningsmodel

**BESLUTTET:** Gainora hjælper virksomheder med at forbedre indtjening gennem dokumenterede økonomiske analyser og konkrete handlinger. Betalende kunder og en fungerende salgsproces kommer først. Tre netværk: kunder, salgspartnere og leverandører. Leverandørprovision må aldrig bestemme anbefalingerne.

**Historisk beslutning, fundet i samtaleuddrag:** Gainora 2.0 blev valgt som selvstændig løsning 6. oktober, med egen kontrol over kode og data. Polsia er prototype/reference. RevenuePilot er tidligere navn; Pænt Betalt er et særskilt produktkoncept under Gainora, ikke dokumentation for fakturafunktioner i denne kodebase.

Produktprincippet er observation → beregning → handling → menneskelig godkendelse → gennemførelse → dokumenteret værdi. Estimater og følsomhedsscenarier er aldrig realiserede besparelser. [Profit Intelligence Framework](PROFIT-INTELLIGENCE-FRAMEWORK.md) beskriver tolv analyseområder; den aktuelle motor dækker kun et udsnit.

## 2. Eksisterende produkter og funktioner

| Område | Faktisk status ved baseline | Begrænsning |
|---|---|---|
| Dansk landingpage og partnerlandingpage | KODE | CTA er mailto; partnerlinks og pipeline beskrives mere modent end implementeringen |
| Login, signup, bekræftelse, signout | KODE, build/typecheck i CI | Nyt browserforløb ikke testet; signup har stadig engelsk tekst |
| Organisationer og medlemsroller | KODE + live schema | Owner/admin/member/viewer; fuld rolle-/tenant-regression mangler i CI |
| CSV/XLSX-preview og kolonnemapping | KODE; begrænsede unit-tests | 5 MB; enkel CSV-parser; danske tal/datoer, multiline, dubletheaders og XLSX-celletyper kræver mere validering |
| Normaliseret import | KODE, transaktionel DB-RPC | Maks. 10.000 rækker i HTTP-schema; klient angiver selv synthetic |
| Profit Audit | KODE; motor-/analyse-unit-tests | Positive beløb antages omsætning, negative omkostning; ikke generel hovedbogsanalyse |
| Månedstal/kontofordeling | KODE; unit-tests | Run-endpoint mangler pagination; detail-endpoint har pagination |
| Handlingsforslag | KODE, PR #24 merged | Regelbaseret på kontonavne: indkøb, løn, faste udgifter; ingen leverandørtilbud eller AI-kald |
| Opportunities/godkendelse | KODE | Genkørsel sletter fund; mangler robust tilstandsmaskine og fuldt revisionsspor |
| Resultater/værditilskrivning | KODE | Manuelt indtastede beløb/noter; er ikke uafhængig bekræftelse af besparelse |
| Partnerdashboard | KODE, skal | Hårdkodede nuller, ingen tilsluttet partneridentitet eller målings-API |
| Partnerøkonomi | TESTET ren beregningskode, PR #16 | Betalte hændelser, valutaadskillelse; ingen webhook, ledger-skrivning eller udbetaling |
| Pænt Betalt: faktura/rykker | Historisk Polsia-arbejde | Ikke implementeret eller afprøvet i dette repository |
| Leverandørnetværk, medarbejderdashboard | DOKUMENTATION | Ingen implementerede afregnings-/løndashboard-flow |

## 3. Teknisk arkitektur og integrationer

Next.js 16.3.8, React 19.3.0, TypeScript strict, Zod, ExcelJS og Vitest er angivet i `package.json`. Supabase-klienter bruger publishable key og brugerens session; gennemgåede API'er bruger ikke service-role. Next API-routes kalder Postgres via Supabase med RLS. `src/proxy.ts` opdaterer auth-session og sætter private/no-store.

Faktisk importflow: browser → autentificeret preview i serverhukommelse → parser → rækker tilbage til browser → normalisering → `commit_financial_import` → Postgres. Den beskrevne lagring af originalfil i privat bucket er ikke koblet ind i dette HTTP-flow. Retention-helperen beregner syv dage; der findes ikke et planlagt slettejob i repositoriet.

| Integration | Status |
|---|---|
| GitHub | Repository, branches, PR'er og Actions tilgængelige |
| Supabase | Aktiv DB/Auth/Storage; ni migrationer og 17 public-tabeller verificeret |
| Vercel | Live readiness-endpoint og GitHub deployment-kommentarer tilgængelige; kontrolplansadgang afvist |
| Stripe | Valgt betalingsretning i historikken; schema-referencer, ingen SDK/checkout/webhook |
| Dinero og e-conomic | Prioriterede datakilder i framework/historik; ingen connector-kode |
| BankView/bankdata | Plan; præcis leverandør, samtykkeflow og integration ikke verificeret |
| OpenAI/AI | Arkitekturplan; ingen implementeret modelintegration eller aktiveret dataflow fundet |

## 4. Status på GitHub, Supabase og Vercel

### GitHub

Main CI [37732159658](https://github.com/expicom-jpg/gainora/actions/runs/37732159658) er success for baseline-SHA. PR #24 CI [37732025803](https://github.com/expicom-jpg/gainora/actions/runs/37732025803) har verificeret succes for npm audit, typecheck, unit-tests og build. Ingen lint-kommando, browser-E2E eller DB-isolationstest findes i det nuværende CI-workflow. Der er syv unit-testfiler med 14 tests i baseline-koden; historiske Polsia-tal som 448 tests gælder ikke denne kodebase.

Alle aktuelle PR-heads #6–#33 har en returneret succesfuld PR-CI-kørsel. Dette er ikke komplet Actions-historik: connectoren returnerer første side og kun PR-triggered runs. Gamle fejl kan derfor eksistere samtidig med grønne seneste heads. Ingen lockfil er tracked; CI bruger `npm install`, så afhængighedsopløsningen er ikke reproducerbar.

| PR | Status | Indhold og næste håndtering |
|---|---|---|
| #6, #7, #9–#16 | Merged | Foundation, tests, storage-schema, RLS, pilotflow, design, dansk UI, kommercielt schema og partnerberegning |
| #18, #19, #21–#24 | Merged | Analyse, detaljer, fokuseret UX, kvalitetskrav, læsbare fund og anbefalinger |
| #8 | Åben; konflikter ved kontrollen | Tooling major-opdateringer; gammel grøn CI er ikke tilstrækkelig til merge mod aktuel main |
| #17 | Åben | Ældre analyseforslag; overlap med #18/#23; skal sammenlignes, ikke blindt merges |
| #20 | Åben | Alternativ UX; overlap med #21; afklar rester før lukning |
| #25 | Åben | Tre-netværksstrategi; retningen bekræftet af handover, implementeringen er fremtidig |
| #26 | Åben | Exit-readiness-ramme |
| #27 | Åben | Valgfri investorforberedelse, ikke kapitalrejsningsbeslutning |
| #28 | Åben | Generisk løn-/provisionsforslag |
| #29 | Åben | Medarbejderdashboard-specifikation, ikke et færdigt dashboard |
| #30 | Åben | Sales-first-plan og founder-løn-scenarie |
| #31 | Åben | Tidligere Head of Sales-forslag; #33 er nyere samlet oplæg |
| #32 | Åben | Illustrativ kanaløkonomi |
| #33 | Åben | Samlet forhandlingspakke og advokatbrief; ingen underskrevet aftale |

Issues #1 og #2 er lukkede som completed; #3 import, #4 readiness og #5 audit/approval er åbne. Lukket issue #2 er ikke bevis for nuværende automatiseret isolationstest. README og `docs/STATUS.md` er forældede: de kalder projektet bootstrap og oplister allerede eksisterende kode som næste arbejde. Brug denne daterede baseline ved statusvurdering.

### Supabase

Projektet Gainora 2.0 er `ACTIVE_HEALTHY`, region `eu-central-1`, Postgres 17. Ni live-migrationer svarer navnemæssigt til repository 001–009; live-versionerne er tidsstempler, så reproducerbar migration/reconciliation skal kontrolleres før næste schemaændring. Alle 17 public-tabeller har RLS. `financial-imports` er privat med 5 MB-grænse.

Security advisor: syv INFO om RLS uden policies på kommercielle tabeller, hvilket svarer til den tilsigtede deny-by-default-model; én WARN om deaktiveret leaked-password protection. [Supabase vejledning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Det er ikke et clean security-pass. Tabellers indhold blev ikke hentet; metadata/tabelestimater beviser ikke kundetal eller omsætning.

### Vercel

[Live readiness](https://gainora-self.vercel.app/api/readiness) svarede `environment: staging`, `realCustomerDataReady: false`. Det beviser flagets eksponerede tilstand, ikke komplet kontrol af alle dataindgange. PR #33 har en Ready-preview-kommentar fra Vercel. Vercel-pluginens projektopslag for det kendte team gav 403; ingen Vercel CLI var installeret. Miljøvariabler, region, produktionsdeployment-SHA, domæner, protection, logning og backuprelationer er derfor ikke fuldt verificeret. Ingen secrets er hentet.

## 5. Kundesegmenter, priser og salgsstrategi

**BESLUTTET:** Arbejdspris 2.495 kr./måned ekskl. moms; betalende kunder før netværksudvidelse. Det er ikke dokumenteret betalingsvillighed eller en bindende prisliste.

Aktuelt budskab retter sig mod virksomhedsejere med økonomiske data. Partnerlandingpage nævner revisorer, bogholdere, virksomhedsrådgivere og branche-/netværkspartnere. Endelig ICP, størrelse, branche og dokumenteret salgspipeline er UVERIFICERET.

**Historisk pilotbeslutning fra uddrag:** Første fem virksomheder, 30 dage gratis, uden kort, binding, performance fee eller automatisk overgang til betaling. Bekræft vilkårene i et versionsstyret onboardinggrundlag før kundestart; real-data-gates gælder også gratis piloter.

Praktisk rækkefølge: demonstrer med syntetiske data → kvalificer behov og datakilder → godkend sikker pilot → mål værdi og feedback → indgå særskilt betalt abonnement. Ingen kunder, partnere eller investorer kontaktes under denne opgave.

## 6. De tre netværk: kunder, salgspartnere og leverandører

| Netværk | Vedtaget princip | Implementeringsgab |
|---|---|---|
| Kunder | Abonnement for analyse og handlinger | Betaling, sikker live-onboarding, evidens og retention |
| Salgspartnere | Provision af faktisk betalte abonnementer | Partneridentitet, RLS, attribution, webhook, reversals, ledger og afstemning |
| Leverandører | Aftalt provision på dokumenterede, gennemførte køb; kundens fordel styrer ranking | Hele tilbuds-, matching-, afstemnings- og provisionsflowet |

[Kommerciel datamodel](COMMERCIAL-DATA-MODEL.md) bruger 20 % som konfigurerbar arbejdsmodel, ikke endelig godkendt sats. Historikken ønsker løbende andel, mens kunden er aktiv og partneren fortsat deltager; PR #32 åbner varighed/step-down som aftalepunkt. Dette er en uafklaret vilkårsdetalje, ikke grund til at erstatte ejerens retning.

[PR #25](https://github.com/expicom-jpg/gainora/pull/25) specificerer kundens fakturaer mod leverandørens rapporter, betaling/kreditnota-afstemning, separate ledgers, kontraktversioner og advarsler. Ingen universel leverandørsats er vedtaget. Supplier GMV er kundernes indkøb, ikke Gainoras omsætning.

## 7. Mortens rolle, lønpakke, provision og exitbonus

Tiltænkt rolle: Head of Sales & Business Development. **FORSLAG, ikke underskrevet aftale.** Den autoritative gennemlæste kilde er [PR #33](https://github.com/expicom-jpg/gainora/pull/33), head `e27c98bc29c538366c2394c7a495191ae874800c`, særligt `MORTEN-HEAD-OF-SALES-COMPENSATION-PACKAGE.md`, `MORTEN-PRESENTATION.md` og `MORTEN-LEGAL-REVIEW-BRIEF.md` på den branch.

Pakken omfatter deltidsopstart med kundemilepæle og likviditetskrav; marginal egen provision; teamprovision med særskilte undtagelser; forholdsmæssigt kontant lønloft; betinget årsbonus; pension, ferie, uddannelsesbudget og betalt uddannelsestid; kontant exitbonus optjent på både anciennitet og vægtede aktive kundepoint. Exitbonus er ikke aktier og beregnes på defineret nettoprovenu, ikke automatisk annonceret virksomhedsværdi. Præcise satser og personlige beløb gentages ikke i denne offentlige oversigt.

PR #33 går indholdsmæssigt videre end #31; hverken grøn CI, PR-oprettelse eller ejerens hensigt udgør juridisk godkendelse. Advokatbriefen er en klargjort bestilling, ikke dokumentation for kontakt eller modtaget rådgivning. Ansættelse, optjening/ophør, pensionsgrundlag, bonusbetaler, skat og transaktionsdefinition skal afklares før underskrift. Fortrolige forhandlingsdokumenter bør flyttes til adgangsbegrænset opbevaring efter ejerbeslutning; ændret synlighed fjerner ikke tidligere offentlig eksponering.

## 8. Økonomiske modeller, budgetter og vækstmål

Nedenstående er ren aritmetik ved fuld pris, uden moms, rabatter, churn eller manglende betaling. ARR er annualiseret run-rate, ikke realiseret årsomsætning.

| Betalende kunder (scenarie) | MRR DKK | ARR DKK |
|---:|---:|---:|
| 5 | 12.475 | 149.700 |
| 10 | 24.950 | 299.400 |
| 25 | 62.375 | 748.500 |
| 50 | 124.750 | 1.497.000 |
| 100 | 249.500 | 2.994.000 |
| 500 | 1.247.500 | 14.970.000 |

[COSTS.md](COSTS.md): gammelt pilotbudget 500 kr./måned, interval 150–900 kr.; estimat, ikke aktuelle regninger eller indhentede priser.

PR #32 modellerer 100 kunder fordelt på egne sælgere og eksterne partnere: 249.500 kr. abonnementer, 30.938 kr. provisioner, 24.950 kr. variable omkostninger og 101.737 kr. residual efter scenariets løn/faste udgifter. Residual er ikke nettooverskud: vækstmarketing, skat, churn, tab, fuld medarbejderomkostning og bonusforpligtelser er ikke fuldt medtaget. Den antagne partnerprovision og sælgerprovision er ikke godkendte aftaler.

PR #27 har et ældre to-founder-lønscenarie: 1.368.000 kr. for 12 måneder og 2.052.000 kr. for 18 måneder inklusive 20 % buffer. PR #30 prioriterer efterfølgende salg og bruger nul founder-løn som planforudsætning. De to modeller kan ikke sammenlægges uden nyt cash-flow-budget. To founders, ejerandele, selskab, bankbeholdning, underskrevne kunder og faktiske driftsudgifter er ikke verificeret.

## 9. Datasikkerhed, GDPR og juridiske risici

**BESLUTTET:** Ingen rigtige kunders økonomiske data før verificeret sikkerhed, adgangskontrol, databeskyttelse og eksplicit aktivering. Ingen betalinger eller bindende aftaler er autoriseret.

| Prioritet | Observation | Nødvendig kontrol |
|---|---|---|
| P0 | Readiness er et flag, ikke en dækkende datagrænse. UI sender altid `synthetic:true`; commit accepterer klientmarkering; live RPC har ingen readiness-kontrol | Design og test en server-/DB-håndhævet demogrænse, pilotadgang og direkte DB/API-adgang før real-data-launch |
| P0 | RLS afgrænser rækker, men schema bruger separate FK'er uden samlet tenant/reference-binding | Negative tests for cross-tenant import-/finding-/result-referencer, også ved direkte DB API; korriger constraints/policies |
| P0 | Genkørsel sletter audit_findings; results-FK har ON DELETE SET NULL | Bevar identitet, godkendelser og evidens med transaktionel versionering/idempotens |
| P1 | Run-analysis har ingen pagination | Beregn på alle scoped rækker, fail closed ved tomme/fejlede/for store datasæt |
| P1 | Results kan oprettes uden serverkontrol af godkendt finding; efterfølgende statusopdateringsfejl ignoreres | Atomisk og rollebeskyttet approval/result-flow med audit events |
| P1 | Retention og kundesletning er beskrevet, men ingen fuld worker-/restore-test | Test originalfil-, DB- og backup-livscyklus |
| P1 | Ingen CI-isolation/E2E; dependency lock mangler | Reproducerbar CI, migrations-/rolletests og syntetisk fuldt pilotforløb |
| P1 | Personlige forhandlingsvilkår ligger i offentlige branches/PR'er | Ejerbeslutning om adgangsbegrænsning og håndtering af eksisterende eksponering |

Ingen DPA-, backup-, restore-, slette-, databehandler-/underdatabehandler-, incident- eller AI-vilkårsmappe er verificeret komplet. EU-databaseregion alene dokumenterer ikke alle datastrømme eller compliance. [Privacy-checklisten](PRIVACY-SECURITY.md) er stadig åben. Polsias tidligere afvisning af projektspecifik gennemgang findes i historiske uddrag, men original korrespondance er ikke genlæst.

## 10. Investorstrategi og exitforberedelse

Langsigtet mål: skalerbar, dokumenteret, overdragelig virksomhed. PR #26 beskriver exitambition 75–100 mio. kr.; ikke værdiansættelse, købstilbud eller garanti. PR #27 holder finansiering valgfri. Historiske omtaler af købere/rådgivere er ikke verificerede relationer.

Før ekstern brug: dokumenter selskab/IP, ejerbog, aftaler, actuals, retention, CAC, margin, kundeværdi, data protection, drift og alle betingede bonusforpligtelser. Hold SaaS ARR, leverandør-GMV, optjent provision og modtagne betalinger adskilt. Ingen outreach, kapitaludstedelse eller aftaleindgåelse uden udtrykkelig godkendelse.

## 11. Hvad der allerede er færdigt

- Kodegrundlag og merged inkrementer frem til #24; fortsættes, ikke genstartes.
- Auth-/organisations-/import-/audit-/resultatkode og dansk kerne-UI.
- Ni live DB-migrationer, tenant-RLS og privat bucket.
- Rene beregningsfunktioner for import, analyse og partnerøkonomi med unit-tests.
- Grøn baseline-main-CI samt succesfuld seneste tilgængelige CI for alle undersøgte PR-heads.
- Dokumenteret synthetic-only-retning og eksplicit lukket live readiness-flag.

Dette betyder ikke, at hele kunderejsen, betaling, sikkerhed eller forretningsmodellen er produktionsverificeret.

## 12. Hvad der mangler

1. Luk P0-gab i datagrænse, tenant-referencer og bevarelse af audit/resultater.
2. Ret fuldstændig analyseindlæsning og importvalidering; test større filer og økonomiske fortegn/kontotyper.
3. Verificer Vercel-kontrolplan, miljøer, deploy-SHA og adgangsbeskyttelse.
4. Reproducerbar CI med DB-/API-rolletests og browserrejse; versionsfast dependencies.
5. Dokumenter og afprøv privacy, backup/restore, retention/sletning og incident-flow.
6. Syntetisk demo med korrekt scope, support/runbook og versionsstyrede pilotvilkår.
7. Stripe test-mode, webhook-idempotens, refunds og eksplicit pilot-til-betalt accept.
8. Praktisk ICP/pipeline og måling af konvertering, supporttid og dokumenteret værdi.
9. Partneridentitet/attribution/ledger; senere leverandørnetværk og medarbejderdashboard.
10. Afstem kommercielle udkast og modstridende budgetforudsætninger; juridisk godkendelse før aftaler.

## 13. Prioriteret udviklingsplan — næste 90 dage

Planforslag 8. oktober 2026–5. januar 2027 (90 kalenderdage inklusive startdagen). Milepæle er betinget af verificeret kvalitet, adgang og nødvendige ejerbeslutninger; ikke salgsløfter.

| Periode | Prioritet og leverancer | Acceptkriterium |
|---|---|---|
| Dag 1–7 | Master Brief, sikkerhedsgab registreret, fuldstændig analyseindlæsning, reproducerbar teknisk baseline | PR'er med konkrete regressionstests; ingen real-data-aktivering |
| Dag 8–21 | Datagrænse/tenant-referencer, atomisk audit/approval/result, importvalidering, DB- og browsertests | Forkerte roller/tenants afvises; genkørsel bevarer historik; alle tal afstemmes |
| Dag 15–30 | Demo, ICP/tilbud, pilotvilkår, supportflow, privacy-/restore-/slettepakke og Vercel-verifikation | Reproducerbar syntetisk demo; tydelig ejerbeslutning før live pilot |
| Dag 31–45 | Kontrolleret første pilotgruppe, når gates er godkendt; Stripe test-mode og betalingsafstemning | Dokumenteret tid til første værdi, feedback og signeret betalingsaccept; ingen automatisk gratis-til-betalt overgang |
| Dag 46–60 | Pilotkonvertering, kanal-attribution og første regnskabsconnector efter valideret databehov | Faktisk modtaget betaling og afstemt analyse; isolerede OAuth-/adgangsflows |
| Dag 61–90 | Retention/unit economics, gentagelig salgsproces; næste connector, partnerledger efter behov | KPI'er afstemt mod betalinger; ansættelse/skalering kun med budget og juridisk godkendelse |

Dinero og e-conomic er prioriterede integrationsretninger; indbyrdes rækkefølge vælges efter piloternes faktiske systemer. Bankdata følger samme sikkerheds- og datakvalitetskrav. Growth, AI, Assets, internationalisering og fuldt supplier-system udskydes, medmindre dokumenteret kundeværdi begrunder dem.

### Beslutninger og adgang, som kræver ejerens handling

- Gendan adgang til det eksisterende Vercel-team/projekt uden at dele secrets i chat.
- Beslut adgangsbegrænsning for fortrolige forhandlingsdokumenter i det offentlige repository.
- Godkend endelige aftaler, budgetter, eventuel ansættelse, investering og ekstern kontakt særskilt.
- Real-data-aktivering kræver særskilt eksplicit beslutning efter dokumenteret gate-pass.

### Kilderegister

- Ejerens Master Project Handover, 8. oktober 2026: gældende mandat og kommercielle rammer.
- Historikværktøjets uddrag hentet samme dag: daterede samtalepåstande, ikke fuld historik.
- [Baseline-kode](https://github.com/expicom-jpg/gainora/tree/ad24bdc928b2ea903cc09f6669944a7b024e24b6), især `src/app/api`, `src/lib`, `supabase/migrations`, `docs`, CI og manifest.
- [PR'er](https://github.com/expicom-jpg/gainora/pulls), [issues](https://github.com/expicom-jpg/gainora/issues), individuelle heads og CI kontrolleret 8. oktober.
- Supabase read-only metadata: projekt, migrationer, tabeller, policies, bucket og live import-RPC samt security advisor; ingen kundeposteringer hentet.
- Vercel 403-projektopslag, GitHub deployment-kommentar samt live readiness-endpoint; adgangen er udtrykkeligt begrænset.


## Teknisk opdatering 8. oktober 2026

PR #38 bevarer audit-historik og registrerer resultater atomart; PR #39 låser npm-afhængigheder og anvender `npm ci`. Den efterfølgende faste demo erstatter filupload og lukker direkte importrettigheder; se [FIXED-SYNTHETIC-DEMO.md](FIXED-SYNTHETIC-DEMO.md) for omfang, tests, deploymentrækkefølge og resterende begrænsninger. Tidligere beskrivelser af CSV/XLSX-import ovenfor er historik, ikke en aktuel åben funktion. Rigtige kundedata er fortsat ikke godkendt.
