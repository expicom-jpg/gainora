# Gainora – aktiv Master/Partner-udvikling og prioriteret roadmap
Opdateret 24. oktober 2026. **Plan/udvikling; ikke production-ready.**

## P0 – SKAL være klar før de første fem pilotkunder
1. **Master Audit Log**: tidsstemplede og revisionssikre hændelser, hvem/hvad/hvornår, sikker søgning og kontrol med ændringer.
2. **Master Alerts**: højt prioriterede advarsler om mistænkelige loginforsøg, ændring af rettigheder, provision, partner-/kundetilknytning og compliance-eksporter.
3. **Automatisk partner-onboarding**: Master-godkendelse før aktivering, unikt partner-ID, individuelt login, verificeret invitation, aftaleaccept og automatisk isoleret dashboard. Morten og hans fem piloter skal tilknyttes fra første oprettelse.
4. **Master opgave- og godkendelsesindbakke**: én samlet, personlig indbakke for ejeren. Der kommer opgaver ind fra rettighedsansøgninger, ny medarbejder, nye partnere, adgangsændringer, sikkerhedsalarmer og andre godkendelseskrævende handlinger. Kun ejeren som eneste Master kan godkende, afslå eller tilbagekalde Master-beslutninger. Ingen stiltiende auto-godkendelse.
5. **Officiel Gainora-partnermail + sporbar kommunikation**: alle godkendte partnere får en unik Gainora-mailadresse som del af onboarding. Partnerens kommunikation på vegne af Gainora skal ske via denne adresse og knyttes til korrekt partner, kunder og relevant aftalehistorik. Master skal kunne suspendere og tilbagekalde mailadgang.

### Besluttet P0-model – Google Workspace knyttet til partnerens Gainora-login
- **En partner → ét individuelt Gainora-login → én Master-godkendt Google Workspace-identitet med mail og kalender.** Google er valgt, Resend og Zoho er fravalgt.
- Master godkender først partneren; en autoriseret backend-proces opretter eller tildeler derefter Google Workspace-konto med unik officiel Gainora-mailadresse og Google Kalender, verificerer resultatet og binder det til et uforanderligt partner-ID. Ingen adgang gives før godkendelse og vellykket oprettelse.
- Partneren bruger kun Gainora Partner Hub som arbejdsflade: mail, svar, tråde, søgning, møder og kalender. Ingen Google Docs, Sheets, Drive eller generel Workspace-brugerflade tilbydes via Gainora.
- Partneren må ikke ændre den officielle afsenderadresse, Google-kontotilknytning eller identitet. Kun Master kan autorisere ændring/ophør; adgang håndhæves serverside på hvert API-kald.
- **Ingen kendte eller delte Google-adgangskoder.** Brug Googles officielle API'er og sikker token-/serviceautorisering, med snævre rettigheder. Gainora-login alene blokerer ikke nødvendigvis direkte Google-login: det kræver verificeret Workspace-loginpolitik/SSO, og dette skal afprøves konkret inden pilot.
- Master får lovligt, rollebeskyttet og revisionslogget overblik over den officielle mailkorrespondance på tværs af partnerkonti: søgning, dokumentation og eksport efter afklaret Workspace/eDiscovery-setup, databehandlingsgrundlag og kommunikeret kontrolpolitik. Ingen skjult eller uautoriseret bagdør.
- Kun egen mailbox/kalender for partneren; downline giver ikke adgang til underpartneres postkasser. Beskyt også søgning, historik, vedhæftninger og kalenderaftaler mod adgang på tværs.
- Når Master suspenderer partneren, ophører Gainora-adgangen straks, og ekstern Google-adgang/tokens skal deaktiveres via en kontrolleret, verificeret proces.
- Før pilot: faktisk Gainora-domæne, Workspace-licenser og budget pr. partner, API/SSO, MFA, DNS, mail- og kalenderflow, retention/eDiscovery og GDPR skal være afklaret. Test Morten og en separat partner med forskellige konti.
- **Status:** Arkitekturen er besluttet og dokumenteret, men Google-konti, integration og sikkerhedstest er endnu ikke gennemført.

### Krav til samlet Master-indbakke
- Ét beskyttet overblik over `pending`, `in_review`, `approved`, `rejected`, `completed` med filtrering, type, prioritet, dato og ansvarlig.
- Hvert element har entydigt ID, kildehenvisning, nødvendige oplysninger, deadline (hvis reel), risikovurdering, handlinger og fuld audit.
- Godkend/afvis kræver aktiv handling med verificeret Master-session, server-side RBAC/RLS og transaktion, der atomisk registrerer beslutning og udfører/planlægger den tilladte effekt.
- Kun den eneste Master kan godkende ansatte, compliance-adgange, nye partnere og deres særlige rettigheder; eventuel anden opgavefordeling må ikke give Masterbeføjelser.
- Hurtig fratagelse af rettigheder, blokerings-/suspenderingsflow og tydelig kvittering når ændringen faktisk er udført. Ingen positive UI-beskeder ved fejlet databaseopdatering.
- Master Alerts vises i samme indbakke men holdes tydeligt adskilt fra godkendelsesanmodninger: en alarm kan kræve vurdering, men er ikke automatisk en tilladelse.
- Ingen partner, kunde, ansat eller anden admin ser Master-indbakken. Audit- og sikkerhedslogs kan kun åbnes med passende rolle.
- Beskyt mod dobbeltklik/race, tabte hændelser, selv-godkendelse, replay, falske actor-ID'er og utilsigtet rettighedseskalering.
- Test fuldt flow med syntetiske brugere: oprettelse -> Master ser anmodning -> godkender -> rettighed aktiveres; afvisning -> adgang forbliver lukket; tilbagekaldelse -> aktive sessioner mister adgang.

## Allerede lagt som første, testbare kodeunderlag på udviklingsgren
- `src/lib/partner/operations-core.ts`: stærkt typede revisionshændelser, Master-alerts og fail-closed partneraktivering.
- `src/lib/partner/operations-core.test.ts`: tests for aktivering og alarmsignal.
- `src/lib/master/approval-inbox-core.ts`: valgidering af Master-beslutninger for opgaveindbakken.
- `src/lib/master/approval-inbox-core.test.ts`: test af default-deny og beslutningsregler.

**Mangler stadig**: migrations/databaselag/RLS, autoriserede server-handlinger, UI, invitationsmail, persisteret kø/audit og ende-til-ende-tests. Ingen rigtig partner/ansat aktiveres alene med dette kodeunderlag.

## P1–P3: Syv efterfølgende moduler (nummerering fra den oprindelige funktionsliste)
### P1 – efter sikker pilotstart
A. **Visuel downline og provisionsoversigt** – hierarki og aggregerede nøgletal inden for egen gren; ingen sidegrene.
B. **Automatisk provisionsafregning** – bogfør faktiske betalinger/returbetalinger, afstem, lad Master godkende udbetalinger.
C. **Pilot- og kundeopfølgning** – opgaver, påmindelser og konverteringspipeline ved dag 7, 14 og 30.

### P2 – før systematisk partnerudrulning
D. **Udvidet aftale- og dokumentstyring** – versionsstyring, accept, dokumentation for partneraftaler og gældende provisionssatser. Basal aftaleaccept og mailhistorik er rykket til P0.
E. **Udvidet intern beskedfunktion** – samarbejde Gainora/partner/medarbejder med særskilt adgangskontrol og integration til den officielle Gainora-mail; ikke automatisk adgang til compliance. Basis-mail er P0.

### P3 – når partnernetværket skalerer
F. **Partner Academy** – selvbetjent oplæring, produktviden, godkendt salgsmateriale.
G. **Master Business Intelligence** – samlet omsætning, kundetilgang/-afgang, provision, supportbelastning og dokumenteret kundeeffekt.

P1–P3 er planlagt, **ikke startet**. Hver funktion kræver særskilt udvikling, sikkerhedstest og godkendelse før produktionsrelease.

## Parkeret mulighed – Ventora (først efter pilot)
- Kilde: https://ventora.cc/
- **Status:** Ingen køb, ingen integration og ingen adgang til Gainoras systemer.
- Når de første fem pilotkunder er onboardet, platformen er stabil, og kundeanskaffelse/markedsføring prioriteres, genvurderes Ventora som mulig hjælp til kampagner, landingssider og leadgenerering.
- Beslutningskriterier: konkret dokumenteret effekt, pris, sikkerhed, databehandlerforhold og sammenligning med vores eksisterende værktøjer. Priser/funktioner kontrolleres igen ved vurderingen.
- Første eventuelle test bør være gratis eller lavrisiko, separat fra produktion og **uden adgang til GitHub, Supabase, Stripe eller kundedata**.
- Ikke et pilotkrav. Må ikke forsinke Master Control, Partner Hub, Google-integration, Compliance eller Excel-import.

## Efter pilot: vurder Ventora til markedsføring og kundeanskaffelse
- **Kandidat på observationslisten:** https://ventora.cc/
- **Genbesøg når** de første fem pilotkunder er onboardet, løsningen er sikker og stabil, og Gainora er klar til aktiv kundeanskaffelse / skalering.
- Vurder en afgrænset gratis eller billig test af markedsføring, leadgenerering og landingssider med målbare KPI'er som leads, bookingrate, pris per kvalificeret lead og faktiske konverteringer.
- **Ingen ny opgave før pilotklarhed.** Ventora må ikke forsinke Master Control, Partner Hub, Google-integration, compliance eller sikker dataimport.
- Giv aldrig Ventora adgang til Gainoras produktions-GitHub, Supabase, Stripe, Workspace-konti eller kundedata blot for en test. Kræv uafhængig vurdering af databehandling, adgangsrettigheder, faktiske leverancer og økonomi før eventuel integration.
- Status: **Gemt som en fremtidig beslutningsmulighed, ikke valgt, købt eller implementeret.**
