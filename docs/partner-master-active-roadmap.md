# Gainora – aktiv Master/Partner-udvikling og prioriteret roadmap
Opdateret 24. oktober 2026. **Plan/udvikling; ikke production-ready.**

## P0 – SKAL være klar før de første fem pilotkunder
1. **Master Audit Log**: tidsstemplede og revisionssikre hændelser, hvem/hvad/hvornår, sikker søgning og kontrol med ændringer.
2. **Master Alerts**: højt prioriterede advarsler om mistænkelige loginforsøg, ændring af rettigheder, provision, partner-/kundetilknytning og compliance-eksporter.
3. **Automatisk partner-onboarding**: Master-godkendelse før aktivering, unikt partner-ID, individuelt login, verificeret invitation, aftaleaccept og automatisk isoleret dashboard. Morten og hans fem piloter skal tilknyttes fra første oprettelse.
4. **Master opgave- og godkendelsesindbakke**: én samlet, personlig indbakke for ejeren. Der kommer opgaver ind fra rettighedsansøgninger, ny medarbejder, nye partnere, adgangsændringer, sikkerhedsalarmer og andre godkendelseskrævende handlinger. Kun ejeren som eneste Master kan godkende, afslå eller tilbagekalde Master-beslutninger. Ingen stiltiende auto-godkendelse.
5. **Officiel Gainora-partnermail + sporbar kommunikation**: alle godkendte partnere får en unik Gainora-mailadresse som del af onboarding. Partnerens kommunikation på vegne af Gainora skal ske via denne adresse og knyttes til korrekt partner, kunder og relevant aftalehistorik. Master skal kunne suspendere og tilbagekalde mailadgang.

### Krav til officiel partner-mail – Google Workspace er valgt (P0)
- **Beslutning: Google Workspace** til Gainoras officielle virksomheds-mail, Gmail, Drive, Docs, Sheets, Calendar og Meet. Resend er **ikke længere** den planlagte primære partner-mailtransport.
- Hver godkendt partner skal have en unik officiel Gainora-mailadresse i et verificeret domæne. **Én personlig Workspace-bruger/postkasse pr. partnerbruger** er udgangspunktet, hvis vedkommende skal have en selvstændig fuld Gmail-indbakke; dette kan kræve betalt licens pr. bruger. Alternativet delegeret postkasse/gruppe/alias skal vurderes særskilt; et alias alene skaber ikke selvstændig postkasse eller personligt login.
- Partneren kan bruge Gmail direkte. Gainora Partner Hub skal integrere relevante mailfunktioner via Gmail API med sikre, begrænsede tilladelser og korrekt adgang til **egen** postkasse, mailtråde og egne leads. Ingen direkte adgang til andres mailbox eller downline-mail via hierarkiet.
- Master godkender partneren og alle tilknyttede medarbejderrettigheder; efter verificeret domæne, mailudbyderkonfiguration og korrekt licens kan et sikkert backend-job oprette/invitere Workspace-brugeren gennem Google Admin SDK Directory API, hvis domænets administrator har givet de nødvendige rettigheder. Ventestatus indtil faktisk Google-kvittering. Hver medarbejder bruger sit personlige login og MFA.
- Master kan suspendere partnerens adgang til Gainora. Google-kontolukning/suspension skal derudover ske gennem Workspace-administration/autoriseret API, og de to handlinger skal afstemmes; de er ikke automatisk den samme handling.
- Kræv sikker OAuth-integration, mindst mulige Gmail-scopes, tokenbeskyttelse, håndtering af Google OAuth-appverifikation ved relevante scopes, kvoter, fejlsituationer og udløb. Delte login/adgangskoder må ikke anvendes.
- Al officiel kundekommunikation på vegne af Gainora skal komme fra den tildelte Workspace-adresse. Registrér kun nødvendige kunderelevante tråde/metadata med lovligt grundlag, adgangskontrol, retention og revisionsspor.
- Opbevaring og eDiscovery ved tvist kræver særskilt beslutning om Workspace-plan og evt. Google Vault/retention. Almindelig søgning i Gmail er ikke i sig selv manipulationssikkert bevisarkiv. Compliance Portal forbliver separat.
- DNS: verificér hvilket Gainora-domæne der ejes, eksisterende MX, SPF, DKIM og DMARC før skift; **ændr aldrig eksisterende MX uden dokumenteret plan**, ellers kan mail gå tabt.
- Før piloten: afklar Workspace-abonnement, licenspris pr. partner, domæneejerskab, aftale/databehandlerforhold, sikkerhed og mulighederne i Directory/Gmail API. Test oprettelse og tovejs mail hos Morten + uafhængig testpartner, isoleret historik og suspension.
- **Status:** Google Workspace er valgt som leverandør; der er endnu ikke oprettet, forbundet eller verificeret mailkonti i Gainora.

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
