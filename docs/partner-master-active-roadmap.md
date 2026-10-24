# Gainora – aktiv Master/Partner-udvikling og prioriteret roadmap
Opdateret 24. oktober 2026. **Plan/udvikling; ikke production-ready.**

## P0 – SKAL være klar før de første fem pilotkunder
1. **Master Audit Log**: tidsstemplede og revisionssikre hændelser, hvem/hvad/hvornår, sikker søgning og kontrol med ændringer.
2. **Master Alerts**: højt prioriterede advarsler om mistænkelige loginforsøg, ændring af rettigheder, provision, partner-/kundetilknytning og compliance-eksporter.
3. **Automatisk partner-onboarding**: Master-godkendelse før aktivering, unikt partner-ID, individuelt login, verificeret invitation, aftaleaccept og automatisk isoleret dashboard. Morten og hans fem piloter skal tilknyttes fra første oprettelse.
4. **Master opgave- og godkendelsesindbakke**: én samlet, personlig indbakke for ejeren. Der kommer opgaver ind fra rettighedsansøgninger, ny medarbejder, nye partnere, adgangsændringer, sikkerhedsalarmer og andre godkendelseskrævende handlinger. Kun ejeren som eneste Master kan godkende, afslå eller tilbagekalde Master-beslutninger. Ingen stiltiende auto-godkendelse.
5. **Officiel Gainora-partnermail + sporbar kommunikation**: alle godkendte partnere får en unik Gainora-mailadresse som del af onboarding. Partnerens kommunikation på vegne af Gainora skal ske via denne adresse og knyttes til korrekt partner, kunder og relevant aftalehistorik. Master skal kunne suspendere og tilbagekalde mailadgang.

### Krav til officiel partner-mail og samlet Master-indsigt – Resend (P0)
- **Valgt startløsning: Resend** som API til afsendelse og modtagelse; Gainora bygger egen mailindbakke og søgning i Partner Hub. Ingen Google Workspace- eller Microsoft 365-licens pr. partner og ingen adgang til eksterne kontorprogrammer. Resend giver ikke en klassisk Gmail-postkasse.
- Hver af Master godkendt partner får en **unik adresse** på Gainoras verificerede domæne eller relevant subdomæne, med partner-ID som entydig afsender-/modtager-routing. Adresse aktiveres først, når afsendelse og modtagelse er testet.
- Partneren kan kun se og sende fra **egen** postkasse inde i Partner Hub; hverken urelaterede partnere, sidegrene eller downline giver indsyn i andre partneres mail.
- **Den eneste Master skal have samlet adgang** til al officiel ind- og udgående partnerkorrespondance i Gainora: søg efter partner, kunde, dato, emne, tekst og tråd; læs hele forløbet og nødvendige vedhæftninger; eksportér relevant sagsmateriale til tvist. Master-adgang sker gennem egen beskyttet side med MFA og audit for læsning/søgning/eksport. Dette er transparent virksomhedsadministration, ikke en skjult teknisk bagdør.
- Systemet skal **selv gemme** fuld relevant mailhistorik og vedhæftninger i beskyttet lager: Resend er mailtransport og må ikke antages at opbevare alle mails til historik, søgning eller bevisformål. Tidsstempler, afsender, modtager, message-id, tråd-id, leveringsstatus og append-only revisionshændelser registreres; historik er ikke automatisk juridisk bevis.
- Indgående Resend-webhooks signaturverificeres og behandles idempotent. Beskedindhold hentes sikkert gennem API, bindes til den korrekte partner og valideres, inden det vises. Udgående afsendelse valideres server-side mod aktiv partner og tilladt Gainora-adresse; ingen vilkårlige From-adresser.
- Kræv SPF, DKIM, DMARC, sikre vedhæftninger, anti-spam/phishing, rate limits, dataminimering, fast retention/sletning, lovligt grundlag, DPA og sikkerhedspolitik. Partneraftalen skal klart beskrive Gainoras adgang til officiel virksomhedsmail og formålet med kontrol og tvistdokumentation.
- Master kan straks suspendere partnerens mailadgang og afsendelse via Gainora; modtagelse til adressen håndteres efter dokumenteret overdragelses-/ophørspolitik.
- Før pilot: verificér ejerskab til reelt Gainora-domæne, vælg korrekt Resend-plan og afklar kvoter for **både indgående og udgående mails**, samt driftsomkostninger ved lager og søgning. Resend-inbound-routing til et separat subdomæne, hvis hoveddomænets MX benyttes til anden mail.
- **Status:** Leverandør- og adgangsdesign er valgt; der er endnu ingen aktiv forbindelse, domæneverifikation, rigtig mailboks eller færdig Master-mailoversigt.

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
