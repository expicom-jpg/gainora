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
7. Compliance får en opgavekø med status ny/under behandling/afventer kunde/løst, kan svare via verificeret kontaktkanal og evt. overdrage almindelig support til andre funktioner.
8. Ved akutte sikkerhedssager markeres hastegrad efter godkendte regler. Ingen chatbot må alene afgøre juridisk ansvar eller love en bestemt tidsfrist.

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
