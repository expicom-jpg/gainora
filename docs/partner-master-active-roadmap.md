# Gainora – aktiv Master/Partner-udvikling og prioriteret roadmap
Opdateret 24. oktober 2026. **Plan/udvikling; ikke production-ready.**

## P0 – SKAL være klar før de første fem pilotkunder
1. **Master Audit Log**: tidsstemplede og revisionssikre hændelser, hvem/hvad/hvornår, sikker søgning og kontrol med ændringer.
2. **Master Alerts**: højt prioriterede advarsler om mistænkelige loginforsøg, ændring af rettigheder, provision, partner-/kundetilknytning og compliance-eksporter.
3. **Automatisk partner-onboarding**: Master-godkendelse før aktivering, unikt partner-ID, individuelt login, verificeret invitation, aftaleaccept og automatisk isoleret dashboard. Morten og hans fem piloter skal tilknyttes fra første oprettelse.
4. **Master opgave- og godkendelsesindbakke**: én samlet, personlig indbakke for ejeren. Der kommer opgaver ind fra rettighedsansøgninger, ny medarbejder, nye partnere, adgangsændringer, sikkerhedsalarmer og andre godkendelseskrævende handlinger. Kun ejeren som eneste Master kan godkende, afslå eller tilbagekalde Master-beslutninger. Ingen stiltiende auto-godkendelse.
5. **Officiel Gainora-partnermail + sporbar kommunikation**: alle godkendte partnere får en unik Gainora-mailadresse som del af onboarding. Partnerens kommunikation på vegne af Gainora skal ske via denne adresse og knyttes til korrekt partner, kunder og relevant aftalehistorik. Master skal kunne suspendere og tilbagekalde mailadgang.

### Krav til officiel partner-mail inden pilot
- Når Master godkender en ny partner, provisioneres partnerens **unikke virksomhedsadresse i Gainoras verificerede maildomæne**, eller opsætningen markeres som afventende. Domæne og mailudbyder skal være konfigureret først; intet system må påstå, at en adresse findes, før den faktisk er oprettet.
- Kun godkendte partnere med aktiv konto og personlige login må sende/modtage fra adressen. Undgå delte adgangskoder. Hvis flere medarbejdere får adgang, sker det gennem særskilte brugeradgange tildelt af Master.
- Partnerens professionelle mail skal være standard og påkrævet afsender ved korrespondance på vegne af Gainora. Personlig mail bruges kun til invitation, sikkerhedsgendannelse og andre afgrænsede identitetsformål, ikke kundedialog.
- Mail sendes og modtages via et understøttet, sikkert udbyder-API eller verificeret mailbox-integration. Sørg for SPF, DKIM, DMARC, TLS, rate limits, spam- og phishingkontrol.
- Log og knyt kun relevante mailtråde/metadata til eget partner-ID og de relevante kunder/kontrakter med lovligt grundlag. Opbevar selve indholdet adgangsbegrænset efter en dokumenteret slettepolitik; søgbar historik må ikke eksponere andre partneres korrespondance.
- Inden partneraktivering skal mailadressen være oprettet, verificeret og testet med både afsendelse/modtagelse. Ved fejl holdes partnerens kundevendte kommunikationsadgang inaktiv og Master får en opgave.
- Master kan deaktivere/suspendere mailbox og intern adgang omgående; sikker overdragelse og arkivadgang kræver sporbar ejerbeslutning og databeskyttelseshensyn.
- Kunders compliance-kommunikation forbliver i den sikrede Compliance Portal. En partner-mail giver aldrig automatisk adgang til compliance-sager.
- Test separat for Morten og en anden partner: unik adresse, isolation mellem indbakker, historik, tilbagesporing til relevante leads og spærring ved suspension.
- **Leveranceafhængighed:** vælg/forbind mailudbyder, verificér faktisk Gainora-domæne, og afklar mailbox-licenser, priser, retention og databehandleraftale. Ingen adresse eller mailforsendelse er etableret af dette dokument.

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
