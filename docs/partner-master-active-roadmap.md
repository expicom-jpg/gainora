# Gainora – aktiv Master/Partner-udvikling og prioriteret roadmap
Opdateret 24. oktober 2026. **Plan/udvikling; ikke production-ready.**

## P0 – SKAL være klar før de første fem pilotkunder
1. **Master Audit Log**: tidsstemplede og revisionssikre hændelser, hvem/hvad/hvornår, sikker søgning og kontrol med ændringer.
2. **Master Alerts**: højt prioriterede advarsler om mistænkelige loginforsøg, ændring af rettigheder, provision, partner-/kundetilknytning og compliance-eksporter.
3. **Automatisk partner-onboarding**: Master-godkendelse før aktivering, unikt partner-ID, individuelt login, verificeret invitation, aftaleaccept og automatisk isoleret dashboard. Morten og hans fem piloter skal tilknyttes fra første oprettelse.
4. **Master opgave- og godkendelsesindbakke**: én samlet, personlig indbakke for ejeren. Der kommer opgaver ind fra rettighedsansøgninger, ny medarbejder, nye partnere, adgangsændringer, sikkerhedsalarmer og andre godkendelseskrævende handlinger. Kun ejeren som eneste Master kan godkende, afslå eller tilbagekalde Master-beslutninger. Ingen stiltiende auto-godkendelse.
5. **Officiel Gainora-partnermail + sporbar kommunikation**: alle godkendte partnere får en unik Gainora-mailadresse som del af onboarding. Partnerens kommunikation på vegne af Gainora skal ske via denne adresse og knyttes til korrekt partner, kunder og relevant aftalehistorik. Master skal kunne suspendere og tilbagekalde mailadgang.

### Krav til samlet partner-mail og kalender (P0) – Resend fravalgt, leverandør under afklaring
- **Resend er afvist** som primær partnerløsning, fordi der mangler en integreret kalender. Ingen mailleverandør skal aktiveres, før både mail, kalender og Mastertilsyn er verificeret.
- **Første kandidat: Zoho Mail Premium**, der omfatter erhvervsmail, kalender samt eDiscovery/mailarkiv. Zoho Mail Lite har også kalender, men leverer ikke eDiscovery, som er nødvendig for den ønskede centrale søge- og dokumentationsfunktion. Sammenlign eventuelt med Google Workspace inkl. egnet Vault-plan og Exchange Online.
- Hver partner får individuel officiel Gainora-mail og kalender. Partneren ser kun egen forretning, egen kalender og egne mails. Downline giver ikke adgang til underpartneres postkasser.
- Kun Gainoras ene Master skal have særligt autoriseret, revisionslogget adgang til hele den officielle partnerkorrespondance, med søgning, visning, eksport og historik til dokumentation. Dette kræver udtrykkelig aftale og korrekt juridisk grundlag, gennemsigtighed og dataminimering, ikke en skjult bagdør.
- Verificér plan, licensvilkår og de konkrete eDiscovery-/adminfunktioner før køb. Selv en udbyder-superadmin er ikke nødvendigvis identisk med Gainoras eneste Masterrolle; konti, nødadgang, udbyderroller og API-begrænsninger skal gennemgås.
- Master kan godkende partnerkonti og straks suspendere Gainora-adgang. Mail- og kalenderadgang skal også kunne suspenderes i udbyderens adminsystem; fejl skal eskaleres.
- Test med Morten og en anden partner: separate postkasser og kalendere, sending/receiving, mødeindkaldelser, adgangsisolation, Master-søgning/eksport, audit og suspension.
- Domæne/DNS, mailudbyderaftale, MFA, retention, GDPR/databehandleraftale og omkostninger pr. partner skal afklares inden pilot. **Status: Ingen leverandør opsat; kandidat skal godkendes og testes.**

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
