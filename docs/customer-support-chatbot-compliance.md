# Gainora kundeservice-chatbot → compliance: pilotkrav

Status: **kravspecifikation, ikke implementeret eller godkendt**. Indgår i pilot-gate sammen med sikker Profit Audit, Excel-import og Mortens Partner Hub.

## Formål
En synlig AI-chat på website, eventuelt også i login-området, besvarer hyppige kundehenvendelser om Gainora. Når botten ikke kan løse henvendelsen korrekt og sikkert, oprettes en sag i den interne **compliance-kø**. En faktisk, vedvarende sag er et krav for at skrive "sagen er sendt videre".

## Samtaleforløb
1. Kunde åbner chat, får besked om AI og en kort privatlivsmeddelelse. Anonym FAQ er muligt uden login.
2. Botten besvarer alene på basis af redaktionelt godkendt, versionsstyret viden: pilotbetingelser, produkter, importformater, priser, fakturering og adgang.
3. Botten spørger maksimalt om det nødvendige og opfordrer ikke til at indsætte fakturaer, CPR, betalingskort, API-nøgler eller følsomme oplysninger i chatten.
4. Eskalér ved usikkerhed, utilstrækkelig viden, kundeønske om menneske, klager, sikkerhedshændelser, persondatarettigheder, juridiske/compliance-spørgsmål eller kontospecifikke spørgsmål der ikke kan besvares uden sikker identifikation.
5. Efter tydelig accept registreres et minimum af nødvendige data: sags-id, oprettelsestidspunkt, kategori, prioritet, kontakt-/organisations-reference hvis relevant, kort opsummering, nødvendige chatuddrag, status og kø=COMPLIANCE.
6. Sagsoprettelse skal ske serverside i et organisations- og rollebeskyttet register; log den konkrete succes eller fejl. Ved succes vises sagsnummer. Ved fejl vises **ikke** at sagen er sendt, men en godkendt alternativ kontaktmulighed.
7. Compliance får en opgavekø med status ny/under behandling/afventer kunde/løst og svarer **direkte i den samme chat-tråd**, som kunden startede. Kunden kan besvare compliance og fortsætte samtalen i samme tråd. Almindelige supportsager kan fordeles til en passende medarbejder.
8. Ved akutte sikkerhedssager markeres hastegrad efter godkendte regler. Ingen chatbot må alene afgøre juridisk ansvar eller love en bestemt tidsfrist.

## Separat Compliance Portal – dedikerede medarbejdere
- Compliance får egen beskyttet side efter login, fx `/compliance`, med særskilt rolle `compliance_agent` og eventuelt `compliance_manager`. Kun autoriserede brugere må komme ind; adgang kan gives, ændres eller tilbagekaldes af Gainora-admin.
- Den dedikerede medarbejder får en **indbakke** med nye/åbne/afventer kunde/afsluttede/genåbnede sager, prioritet, ansvarlig og svartid.
- Compliance kan overtage eller tildele sager til en medarbejder, læse den relevante chatkontekst, vælge svarform **Løbende dialog** eller **Endeligt svar** aktivt for hver besked, og sende svaret direkte i samme kundechat.
- Dedikerede medarbejdere får egne individuelle logins; ingen fælles compliance-adgangskode. Server-side tilladelsescheck, sessionssikkerhed og auditspor på læsning, eksporter og ændringer.
- Der skal være **søgbar historik** efter sagsnummer, virksomhed (kun hvis adgang), dato/periode, emne, status, medarbejder og sikre fuldtekstsøgekriterier. Søgeresultater må aldrig vise data fra utilgængelige organisationer.
- Sagsdetalje viser kronologisk **tidslinje**: chatbeskeder fra bot/kunde/compliance, tidspunkt, afsenderrolle, valget løbende/endeligt, overdragelser, statusændringer, interne notater, levering og kvitteringer. Interne notater vises aldrig til kunden.
- Historik opbevares efter fastsat, dokumenteret databevarings- og slettepolitik, med begrænsning af personlige/fortrolige oplysninger og mulighed for korrekt håndtering af indsigt, sletning og lovlige opbevaringsbehov.

## Dokumentation og tvist
- Originale ind- og udgående beskeder samt væsentlige hændelser bevares på en manipulationskontrolleret måde, fx append-only audit-events med kædede hashes eller en tilsvarende revisionssikker løsning. Rettelser skal fremgå som nye begivenheder frem for lydløst at overskrive historik.
- Registrér meddelelsernes tidsstempler, autentificerede afsendere, reference til sag/kunde, svartype, statusændringer og teknisk afsendelses-/leveringsstatus. Skeln mellem `oprettet`, `afsendt`, `leveret` og `læst`; påstå ikke mere end systemet faktisk kan dokumentere.
- Autoriseret compliance-manager kan generere en **sagsrapport** med tidslinje, dokumentation, revisionsspor og relevante bilag (PDF/CSV efter behov), med rapport-ID og eksportlog. Rapporten skal være egnet som materiale ved tvist, men **er ikke i sig selv garanti for juridisk bevisværdi**.
- Lovlighed, databehandling, dokumentbevarelse, signatur-/tidsstempelstandarder og konkret anvendelse som bevis skal vurderes juridisk. Begræns uforholdsmæssig opbevaring og forhindre vilkårlig adgang/masseeksport.
- Undgå at bruge uverificerede anonyme webchats som sikkert bevis for en bestemt persons identitet; oplys identitets- og kvitteringsniveau i sagsrapporten.

## Historik som grundlag for læring
- Compliance kan bruge historikken til at finde tidligere lignende sager i **sit eget autoriserede arbejdsområde** og foreslå et svarudkast med kildehenvisning. Interne private svar må ikke automatisk sendes til andre kunder.
- Et **Endeligt svar** lukker sagen, men er ikke automatisk godkendelse til den fælles chatbot-viden. Et separat, frivilligt **Foreslå til vidensbase**-valg kræver redaktionel gennemgang, anonymisering og særskilt godkendelse.
- **Løbende dialog** forbliver åben og kan indgå i den komplette historik; den er ikke en godkendt afsluttende løsning.
- Godkendte vidensartikler kan søges i compliance-portalens vidensbank, med udgave, godkender, gyldighed, kilde-sags-ID og mulighed for tilbagekaldelse.

### Accepttests for portal og tvistedokumentation
- [ ] Dedikeret compliance-bruger kan logge ind og se egen kø og søgbar, autoriseret historik.
- [ ] Partner/kunde/anden virksomhed kan ikke se compliance-portal, interne notater eller andre virksomheders historik – også ved direkte URL/API-anmodning.
- [ ] Tidslinjen viser både løbende og endelige svar, relevante statusændringer, hvem der svarede og teknisk leveringsstatus.
- [ ] En autoriseret manager kan eksportere en sagsrapport, og eksporten registreres i auditloggen.
- [ ] Rettelser og sletninger følger godkendte regler og kan ikke bruges til at manipulere væsentlig sagskronologi.
- [ ] En afsluttet sag genåbnes korrekt ved nyt kundesvar, uden tab af tidligere hændelser.
- [ ] Svarvalg og særskilt læringsvalg testes hver for sig; intet internt svar bliver automatisk til generel chatbotviden.

## Tovejs-chat: compliance ↔ den konkrete kunde
- Når botten eskalerer, knyttes et sikkert `conversation_id` og `ticket_id` til kundens autentificerede organisations-/kontaktidentitet. For anonym websitechat benyttes en verificeret kontakt- eller adgangsmekanisme, inden personlige sagsoplysninger vises.
- Compliance har en intern indbakke med tildelte sager, prioritet og fuld **relevant** kontekst fra tråden. Compliance kan sende et manuelt, synligt svar til kunden med én **Svar i chat**-handling.
- Svaret gemmes som en rollemarkeret besked (afsender: compliance/medarbejder) i samme samtale. Kunden modtager det i chatten og kan svare tilbage; nye kundesvar genåbner eller opdaterer sagen.
- Kun autentificerede, autoriserede compliance-brugere må svare på vegne af compliance. Beskeder journalføres med tidsstempel, afsenderrolle, leveringsstatus og nødvendig revisionshistorik.
- Hvis kunden er offline, vises svaret ved næste besøg på verificeret konto/chat. Notifikation må sendes via tilvalgt og korrekt konfigureret kanal, uden fortrolige detaljer i selve adviseringen.
- Kunden skal tydeligt kunne se, hvornår beskeder kommer fra **Gainora AI** og fra et **menneske i compliance**.
- Kun faktisk gemte/afsendte beskeder må vises som sendt. Fejl ved levering eller adgang skal kunne opdages og genforsøges sikkert, uden duplikerede svar.

## Obligatorisk svarvalg: løbende dialog eller endeligt svar
- Hver gang en compliance-medarbejder trykker **Svar i chat**, skal medarbejderen **aktivt vælge præcis én** svartype: `Løbende dialog` eller `Endeligt svar`. Ingen forudvalgt standard; **Send svar** er deaktiveret, indtil et valg er foretaget.
- Valget gælder **den aktuelle besked**; det skal vælges på ny ved næste svar. API/server afviser enhver afsendelse uden eksplicit `reply_type` i den tilladte enum, også ved omgåelse af brugergrænsefladen.
- **Løbende dialog:** Beskeden sendes til kunden i samme tråd; sagen forbliver åben/under behandling eller afventer kunden, og kunden kan fortsætte dialogen.
- **Endeligt svar:** Beskeden sendes til kunden og markeres som compliance-medarbejderens afsluttende svar. Sagen får status `besvaret/afsluttet` med tidspunkt og medarbejder, men kundens mulighed for at svare eller genåbne ved nyt spørgsmål bevares.
- En besked må ikke automatisk registreres som endeligt svar på baggrund af formuleringen alene. Svartype gemmes sammen med besked-ID, sag, afsenderrolle, tidspunkt og revisionsspor.
- For læring: `Løbende dialog` samler yderligere kontekst, men udløser ikke publicering af et FAQ-svar. `Endeligt svar` opretter **kun et udkast** til generel/anonymiseret vidensartikel. Compliance skal særskilt kontrollere og godkende artiklen, før botten må bruge den på tværs af kunder.
- Hvis kunden svarer efter et endeligt svar, genåbnes sagen sikkert, eller der oprettes en koblet opfølgningssag med den oprindelige historik bevaret.
- Vis en tydelig status for kunden (fx `Vi er stadig i dialog` eller `Compliance har sendt et endeligt svar – du kan svare igen`). Fejlet levering må ikke ændre sagens status.

### Accepttests: tvunget aktivt valg
- [ ] Send-knappen er blokeret, indtil medarbejderen har valgt svartype.
- [ ] Efter én afsendelse nulstilles valget; medarbejderen skal vælge igen ved næste besked.
- [ ] `Løbende dialog` lader sagen være åben; kunden kan svare.
- [ ] `Endeligt svar` registrerer afslutning og kan efterfølges af kundens genåbning.
- [ ] Server/API afviser manglende eller ugyldig svartype.
- [ ] Kun afsluttede sager kan foreslå vidensartikler, og godkendelse er separat fra afsendelse.
- [ ] Audit viser medarbejderens svarvalg pr. besked.

## Læring fra medarbejderens svar i chatten
- Efter hver afsluttet sag foreslår systemet automatisk en anonymiseret **spørgsmål → svar → emne**-vidensartikel baseret på den konkrete dialog; udelad navne, aftaler, fakturanumre og andre kunde-/virksomhedsfortrolige detaljer.
- Compliance kan vælge **Godkend til vidensbase**, **Ret før godkendelse** eller **Kun kundespecifikt – må ikke genbruges**. Ingen automatisk offentliggørelse af menneskesvar.
- Godkendte artikler gemmes versionsstyret med kilde-sags-ID i det interne revisionsspor (ikke i kundevendt svar), godkender, gyldighed og organisation-/global-scope.
- Botten kan derefter genbruge godkendt **generel** viden til andre kunder. Kundespecifikke svar må kun bruges i samme organisations kontekst og med legitim adgang.
- Feedback måler både om svaret var korrekt og om kunden fik løst problemet. Lav confidence, gentagne fejl eller nye regelændringer sender artiklen tilbage til revision.
- Denne læring er en kontrolleret opdatering af vidensbasen, ikke automatisk modeltræning på rå kundehenvendelser.

### Accepttests for menneskelig svarfunktion og læringssløjfe
- [ ] Bot eskalerer → compliance åbner sagen → svarer via **Svar i chat** → kunden ser svaret i samme tråd.
- [ ] Kunden svarer igen, og compliance kan fortsætte/afslutte samtalen.
- [ ] En anden virksomhed, partner eller anonym besøgende kan ikke se eller sende i kundens tråd.
- [ ] Compliance-svar kan opsummeres til anonymiseret vidensforslag, men bruges **ikke** af botten før godkendelse.
- [ ] Afvist eller kundespecifikt svar kan ikke genbruges på tværs af virksomheder.
- [ ] Fejlet levering eller databasefejl må ikke udløse falsk “besked sendt”-bekræftelse.

## Endeligt svar – afkrydsningsfelt til læring
Compliance-medarbejderen kan svare i kundens eksisterende chat-tråd som normalt. Når medarbejderen separat har valgt **Endeligt svar** som obligatorisk svartype, vises desuden et **frivilligt felt, som ikke er markeret på forhånd**:

- [ ] **Endeligt svar – foreslå til chatbot-vidensbase**

**Når feltet ikke er markeret:** Svaret sendes kun til kunden og registreres i kundens adgangsbeskyttede sag. Chatbotten må ikke bruge teksten til fælles vidensbase.

**Når feltet markeres:** Svaret sendes til kunden og der oprettes et **vidensforslag** baseret på spørgsmål, godkendt svar og emne. Systemet skal først fjerne/markere navne, virksomhedsdata, kontrakter, beløb, fakturaoplysninger og andre identifikatorer. Compliance får en kort gennemgang af det rensede generelle svar, hvor det kan godkendes til publicering eller afvises. Først efter eksplicit godkendelse bruges det af botten til andre kunder.

- Afkrydsningen må ikke i sig selv give fri adgang til privat chatindhold; den udløser alene en kontrolleret læringsproces.
- Separat mulighed: **Kun denne kunde** – kan markeres hvis svaret er endeligt, men ikke generelt. Så må botten alene anvende det i det autentificerede kundeforløb, hvis behandlingsgrundlaget tillader det.
- Godkendte vidensemner får versionsnummer, godkender, kilde-sags-ID (kun internt), dato og afgrænsning (global eller organisationsspecifik). Artikler kan tilbagekaldes.
- Ved senere rettelser, genåbnet sag eller negativ feedback sendes tidligere godkendt viden til ny vurdering, før genbrug fortsætter.
- Log beslutningerne auditérbart: hvem markerede feltet, hvem godkendte, og hvilken anonymiseret vidensversion blev oprettet. Udvis ikke private sagsdata i bot-svar.

### Særlige accepttests
- [ ] Svar uden afkrydsning når frem til kunden og skaber **ikke** vidensforslag.
- [ ] Svar med afkrydsning opretter forslag, men publicerer det **ikke automatisk**.
- [ ] Compliance kan kontrollere og godkende anonymiseret svar til botten, som derefter kan genbruge netop den godkendte version.
- [ ] Kunden kan svare tilbage, og genåbning/ændringer udløser ny kvalitetskontrol ved behov.
- [ ] Kundespecifikke, fortrolige eller afviste svar kan ikke deles på tværs af kunder.
- [ ] Dobbeltklik, genafsendelser og netværksfejl medfører ikke dublerede vidensartikler eller falske afsendelsesbekræftelser.

## Løbende empiri og kontrolleret forbedring
Chatbotten skal ikke blot svare på spørgsmål; den skal skabe en systematisk læringssløjfe. Forbedring sker ved opsamling af dokumenterbare mønstre og godkendt viden, **ikke** ved ukontrolleret selvtræning på private chats.

1. **Opsamling:** Gem begrænset og relevant metadata per henvendelse: kategori, om botten besvarede sagen, om den blev eskaleret, kilde/version på brugt FAQ, om kunden fandt svaret hjælpsomt, og anonymiseret problemkategori. Bevar kun nødvendige chatuddrag i den adgangsbeskyttede supportsag efter fastlagt slettepolitik.
2. **Mønstergenkendelse:** Dan oversigter over hyppige spørgsmål, fejlsvar, gentagne produktfejl, manglende artikler, kundeønsker og compliance-henvendelser. Aggreger på tværs af organisationer kun når person- og forretningshemmeligheder ikke kan udledes.
3. **Human-in-the-loop:** Compliance/support gennemgår, retter og godkender de rette svar. Godkendte svar udgives som versionsstyrede vidensartikler med ejer, dato, kilde og gyldighed.
4. **Læringssløjfe:** Nye henvendelser søger i senest godkendte artikler. Tidligere løste sager er kun forslag til nye artikler, aldrig autoritativ kundevendt viden uden godkendelse.
5. **Produktindsigt:** Aggregeret feedback kan blive til fejlrapporter og featureforslag til udviklingsteamet; ingen automatisk produkt- eller compliancebeslutning.
6. **Måling og kvalitet:** Mål løsningsgrad, kundefeedback, eskaleringsgrad, genåbnede sager, kvalitet af citerede FAQ-svar og antal nye godkendte artikler. Tjek stikprøver løbende for hallucinationer og fejl.
7. **Databeskyttelse:** Dataminimering, adskillelse af virksomheder, rollebaseret adgang, redaktionel anonymisering, begrænset opbevaring og dokumenteret behandlingsgrundlag. Private henvendelser må ikke bruges til model-finetuning eller generelle svar på tværs af kunder uden særskilt vurdering og lovligt grundlag.

### Supplerende accepttests
- [ ] To forskellige formuleringer af samme spørgsmål samles i én anonymiseret emnekategori.
- [ ] Ubesvaret spørgsmål bliver til forslag i intern forbedringskø, men ikke automatisk offentlig FAQ.
- [ ] Compliance-godkendelse opretter ny artikelversion, som botten kan bruge efter publicering.
- [ ] Trukket eller forældet FAQ-version kan ikke længere bruges til kundesvar.
- [ ] Kundespecifikke detaljer og fakturadata lækker ikke via samlet læringsbase.
- [ ] Dashboard viser udvikling i løsningsgrad uden at forveksle færre eskaleringer med højere kvalitet.

## Tekniske minimumskrav
- Adskil offentligt website og autentificeret kundeportal. Aldrig implicit kontoadgang ud fra fri chattekst.
- Server-side adgangskontrol og RLS for sager, organisationer og compliance-roller; negative multi-tenant tests.
- Begrænset datalagring, retention/sletning, adgangslog, anti-spam/rate limit, prompt-injektion-beskyttelse.
- Kundedialog må ikke deles med tredjeparter eller anvendes til modeltræning uden afklaret grundlag og passende aftaler.
- Opsæt compliance-ansvarlige og **en reel modtagerkø** inden lancering (ingen opdigtet mailadresse).
- Mål: løsningsrate på godkendte FAQ, eskaleringsrate, fejlede oprettelser, svartider og kundetilfredshed.

## Accepttests inden pilot
- [ ] Kendt FAQ besvares korrekt og med gældende tekst.
- [ ] Ukendt spørgsmål bliver til registreret sag med sagsnummer.
- [ ] Compliance-medarbejder kan faktisk finde sagen, svare og lukke den.
- [ ] Fejl i sagsregister medfører klar, ikke-misvisende feedback.
- [ ] Kunde anmoder om menneskelig hjælp → eskalering.
- [ ] Persondataspørgsmål og mistanke om databrud flagges korrekt.
- [ ] En anden kunde eller partner kan ikke læse sagen.
- [ ] Skærmbillede/test af hele flowet dokumenteres før godkendelse.

**Bemærk:** Chatbot, compliance-sagssystem og modtagerrolle er endnu ikke implementeret af dette dokument. Ingen opgave betragtes som færdig, før kode, deployment og ende-til-ende-tests er gennemført.
