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
