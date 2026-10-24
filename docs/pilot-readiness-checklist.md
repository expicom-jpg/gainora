# Gainora – adgangskriterier for de første fem pilotvirksomheder

Status: Intern implementeringsplan. **Ikke godkendt til rigtige kundedata endnu.**

## Trin 0 – Masterrettigheder og medarbejdergodkendelse (obligatorisk for alle interne områder)
- [ ] **Kun ejeren har Master-rollen**, der giver ret til at tildele, ændre og fratage medarbejderrettigheder i hele Gainora. Der kan ikke oprettes en anden Master af en anden bruger.
- [ ] Alle ansatte oprettes med `pending_master_approval`, uden adgang til nogen interne sider eller API'er.
- [ ] Master har en særskilt side med **umarkerede afkrydsningsfelter** for rettigheder pr. medarbejder og skal godkende eksplicit før adgang.
- [ ] Separate valg for Partner Hub, onboarding, salg, økonomi, Compliance Portal læsning/svar/historik/eksport og chatbotviden.
- [ ] Master kan straks ændre/fratage rettigheder, suspendere bruger og tilbagekalde eksisterende sessionsadgang, med revisionsspor.
- [ ] MFA, entydig ejeridentitet, databasehåndhævet rolle-unikhed og sikker recoveryproces er testet.
- [ ] Negative tests: uautoriseret medarbejder, almindelig admin og partner kan ikke give sig selv/andre rettigheder, tilgå intern side eller kalde dens API.
- [ ] Kravspecifikation i docs/master-access-and-employee-permissions.md på Partner Hub PR #77.

## Trin 0B – fire Master-/Partner-funktioner skal være klar inden pilotstart
- [ ] **Master Audit Log**: serverside registrering og adgangsbeskyttet, søgbar historik over adgang, partnerhandlinger, sikkerhed og compliance-relevante ændringer.
- [ ] **Master Alerts**: relevante sikkerheds- og provisionsalarmer vises med korrekt prioritet i Master-indbakken; mulighed for at kvittere og følge op.
- [ ] **Samlet Master-onboarding:** Du gennemgår partnerdata, aftale, downline, rettigheder og foreslået Gainora-mail på én side, før du aktivt vælger **Godkend og opret partner**. Først derefter oprettes partner-ID, Gainora-login og Google Workspace-mail/kalender via autoriseret integration.
- [ ] **Officiel partner-mail og kalender**: Morten får unik Gainora-mailadresse, selvstændig kalender og mødeinvitationer; al officiel Gainora-kundekorrespondance foregår via adressen og tilknyttes korrekt partner-ID.
- [ ] **Google Workspace er valgt** som mail-/kalendermotor, men partneren arbejder kun i Gainora Partner Hub. Domæne, licens, API, loginpolitik, kalender, mødeinvitation og partnerisolation verificeres før aktivering.
- [ ] Partner 2 har separat mailadresse og adgang; direkte API-kald kan ikke læse eller sende på vegne af Morten.
- [ ] Master kan suspendere partnerens Gainora-adgang og iværksætte sikker suspension af Google Workspace-konto. Fejl fremgår i Master-indbakken.
- [ ] Google Workspace-licenser pr. konto, domæne, Gmail/Calendar/Admin-API, SSO/loginbegrænsninger, databehandlerforhold, eDiscovery, Master-audit og MX-risici er afklaret før rigtige mails.
- [ ] **Kun Master kan søge i og eksportere al officiel partnerkommunikation**, via lovlig, kontrolleret og revisionslogget Google Workspace-eDiscovery/adgang. Ingen partner kan læse andre partneres mail.
- [ ] Nye partnere får ingen adgang før den samlede Mastergodkendelse og faktisk verificeret Google-konto/kalender. En fejl under Google-provisionering stopper onboarding og opretter Master-opgave.
- [ ] Intet system gemmer eller bruger delte Google-passwords; den planlagte begrænsning af direkte Google-login er efterprøvet frem for blot antaget.
- [ ] **Master opgave- og godkendelsesindbakke**: én beskyttet side samler nye medarbejdere, nye partnere, rettighedsændringer og beslutningskrævende hændelser.
- [ ] Alle Master-godkendelser skal være eksplicitte og kontrolleres serverside; afslag holder adgang lukket, og der logges en revisionshændelse.
- [ ] Test konflikt/dobbeltklik, falsk Master-identitet, suspenderet partner, ugyldig invitation og om rettigheder træder korrekt i kraft/ophører.
- [ ] Krav og roadmap: `docs/partner-master-active-roadmap.md` på Partner Hub-grenen PR #77. Fire P0-funktioner må ikke forveksles med de syv senere planlagte moduler.

## Trin A – import og teknisk kvalitet
- [x] Browserbaseret CSV-preview med validering.
- [ ] Excel-preview bygget, testet og godkendt i produktion.
- [ ] Fejlmeddelelser skal pege på kildefil og oprindeligt rækkenummer.
- [ ] Reproducerbare tests med 1, 100, 1.000 og 10.000 syntetiske fakturalinjer.
- [ ] Valider momsstatus, valuta, enheder, negative poster/kreditnotaer og dubletter.
- [ ] Dæk fejltyper som tomme celler, skjulte ark, formler og inkonsistente filer.

## Trin B – datasikkerhed før rigtige filer
- [ ] Kun autoriseret virksomhedsejer/admin må importere for egen organisation.
- [ ] Server-side organisationscheck før enhver lagring, behandling og hentning.
- [ ] RLS-politikker gennemgået, inklusive negative tests for adgang på tværs af to virksomheder.
- [ ] Privat filopbevaring med passende dataadskillelse, ingen offentlig bucket.
- [ ] Kryptering, adgangslog, sletteprocedure og databehandleraftale.
- [ ] Begræns filstørrelser, antal rækker, filtype og ressourceforbrug på serveren.
- [ ] Ingen bank-, person- eller fakturadata logges utilsigtet.
- [ ] Brug ikke pilotkunders fakturaer til AI-træning eller benchmark på tværs af kunder uden særskilt lovligt grundlag.

## Trin C – resultater
- [ ] Skeln konsekvent mellem observationer, estimeret potentiale og dokumenteret besparelse.
- [ ] Bevar sporbarhed til den faktiske faktura og linje.
- [ ] Normaliser produktidentitet, enhed, moms og valuta før prissammenligning.
- [ ] Undgå at præsentere leverandørpriser fra forskellige datoer som aktuelle tilbud.

## Trin D – Partner Hub er en launch-blocker (Morten ejer pilotrelationen)
- [ ] Morten har en aktiv, sikker partnerkonto og rollebaseret adgang.
- [ ] Hver partner har sit eget personlige login og isoleret partnerdashboard; ingen delte adgangskoder og ingen automatisk adgang til andre partneres kundeporteføljer.
- [ ] Gainora-admin har en særskilt **Partner Main**-side til oprettelse/godkendelse/suspendering af partnere, kundetilknytning, aftaleversioner, rettigheder og provisionsoverblik.
- [ ] Fra Partner Main kan Gainora oprette endnu en testpartner og automatisk provisionere et unikt login og dashboard uden kodeændring.
- [ ] Test Gainora-admin, Morten og anden partner som tre adskilte roller inklusive serverside-/RLS-adgangskontrol og reviderbare adminændringer.
- [ ] Alle fem pilotvirksomheder knyttes til Mortens partner-ID ved oprettelse, før de får pilotadgang; ingen midlertidig ejer på Gainoras generelle konto.
- [ ] Kundetilknytningen er varig og auditerbar gennem invitation, 30 dages gratis pilot, eventuel betalt konvertering, tilkøb og opsigelse.
- [ ] Partnerdashboard viser kun Mortens egne kundeemner og virksomheder, kontaktpersoner, onboardingstatus, pilotstart/slut, opfølgning og aftalt kommerciel status.
- [ ] Partneren kan oprette/invitere et lead og se dets status; admin kan godkende oprettelse og styre ejerskab, inkl. registreret ændringshistorik.
- [ ] Server-side adgangskontrol og negative RLS-tests: en anden partner må ikke kunne se, ændre eller overtage Mortens kunder.
- [ ] Partneres standardsynlighed er **kun egen forretning og egen downline**; ingen sidegrene eller andre partneres salg/kunder/provision, heller ikke gennem søgning, API eller eksport.
- [ ] Downline-overblik viser som udgangspunkt kun aftalt hierarki og aggregerede nøgletal; ingen automatisk adgang til underpartneres kundedetaljer, regnskabsdata eller compliance-sager.
- [ ] Enhver udvidet adgang skal komme fra den eneste Master og auditeres. Test med mindst to uafhængige partnere og en underpartner.
- [ ] Partnerrollen giver ikke som standard adgang til kunders fakturaer, økonomiske rådata eller analyser; eventuel deling kræver særskilt tilladelse.
- [ ] Provisionsgrundlag følger partnerrelationen ved senere aktivering af betalte abonnementer/tilkøb og kan afstemmes mod faktiske betalinger, tilbagebetalinger og opsigelser.
- [ ] Ingen provision udbetales på gratis pilot, og foreløbige provisionssatser må ikke beskrives som aftalt kontrakt.
- [ ] Partnerkonto, tildeling, visning, invitationsflow og pilot-til-betaling er testet med syntetiske virksomheder før første rigtige pilot.
- [ ] Nye partnere kan efter admin-godkendelse inviteres, oprette login og automatisk få egen rolle, dashboard, leadpipeline og unikt partner-ID uden kodeændringer eller separat deployment.
- [ ] Opret mindst én anden testpartner og dokumentér, at denne kun kan se egne leads, kunder, provisionsdata og medlemmer (negativ RLS-test).
- [ ] Partnerrelation, aftaleversion og evt. introducer registreres, så partnerens kunder følger korrekt ejerskab gennem pilot, betaling og tilkøb.
- [ ] Udløbne invitationer, dubletkunder, suspendering og administrativ overdragelse med audit trail fungerer.
- [ ] Se detaljeret kravspecifikation: docs/partner-onboarding-and-automation.md i Partner Hub PR #77.

## Trin E – kundeservice-chatbot og compliance-eskalering
- [ ] Chatbot på Gainoras hjemmeside (og relevant i kundeportalen) med tydelig oplysning om at kunden taler med AI.
- [ ] Botten svarer på verificerede FAQ-emner: platform, oprettelse, pilot, priser, importkrav og generelle funktioner; ingen opfundne garantier, priser eller juridiske svar.
- [ ] Botten kan identificere manglende viden, usikkerhed, tekniske problemer, adgangsproblemer, klager og forespørgsler om privatliv/data.
- [ ] Hvis svaret ikke kan gives sikkert, opretter systemet en rigtig support-/compliance-sag i et adgangsbegrænset sagsregister og sender den til compliance-køen; bekræft først eskalering efter vellykket lagring/kvittering.
- [ ] Kunden får sagsnummer, forventet næste trin og mulighed for at supplere sagen uden at gentage alt; ingen falske løfter om svartider.
- [ ] Ved mislykket eskalering får kunden en tydelig alternativ kontaktvej, som først vises når en reel adresse/kanal er konfigureret.
- [ ] Compliance kan se, overtage, svare på, afslutte og dokumentere sagen; almindelige supportsager kan videresendes fra compliance til rette ansvarlige.
- [ ] Compliance har en **separat, rollebeskyttet side ved login** med individuel medarbejderadgang, sagsindbakke, tildeling og søgbar historik.
- [ ] **Kun ejeren af Gainora personligt** kan godkende navngivne compliance-brugere før adgang; ingen almindelig admin, partner eller medarbejder kan selv tildele rettigheden.
- [ ] Ejer skal kunne se, godkende, afvise, ændre og straks tilbagekalde hver enkelt compliance-brugers rettigheder, med MFA og reviderbart godkendelsesspor.
- [ ] Negative adgangstests dokumenterer, at både ikke-godkendte medarbejdere og almindelige Gainora-admins afvises ved læsning, svar, søgning, historik og eksport – også gennem direkte API.
- [ ] Dokumenteret identitetskontrol af ejer og sikker kontogendannelse må ikke udhule kravet om personlig godkendelse.
- [ ] Saghistorikken viser komplet kronologi og revisionsspor for kundechat, medarbejdersvar, aktive svarvalg, hændelser og leveringsstatus.
- [ ] En autoriseret compliance-manager kan eksportere en logget sagsrapport til dokumentation ved tvist, med korrekte forbehold om identitetskontrol og bevisværdi.
- [ ] Historiske sager understøtter søgning og anonymiserede vidensforslag, men ingen automatisk deling uden compliance-godkendelse.
- [ ] Historik, eksport, adgang, databevaring og sletning er rollebeskyttet og testet på tværs af virksomheder.
- [ ] Compliance skal kunne besvare henvendelsen via **Svar i chat** i kundens oprindelige chat-tråd; kunden skal kunne svare tilbage, også efter genåbning.
- [ ] Compliance skal aktivt vælge **Løbende dialog** eller **Endeligt svar** før hver afsendelse; ingen standardværdi. Serveren afviser svar uden et gyldigt valg.
- [ ] Løbende dialog holder sagen åben; endeligt svar lukker/markerer sagen besvaret med mulighed for genåbning. Kun endelige svar må foreslås til ny vidensartikel, stadig med separat menneskelig godkendelse.
- [ ] Menneskets svar skal tydeligt markeres og knyttes til korrekt sag og autoriseret bruger; kun verificeret kunde må læse personlige svar.
- [ ] Afsluttede dialoger skal danne anonymiserede forslag til vidensbasen; compliance skal godkende en generel artikel før chatbotten må genbruge den.
- [ ] I compliance-chatten findes et **frivilligt, umarkeret som standard** felt: "Endeligt svar – foreslå til chatbot-vidensbase". Markering opretter et anonymiseret forslag, som kræver eksplicit godkendelse før chatbotten må genbruge det; umarkerede svar er kun til kunden.
- [ ] Kundespecifikke eller afviste svar må ikke genbruges på tværs af virksomheder.
- [ ] Kritiske sikkerheds-/databeskyttelsessager flagges særskilt; chatbotten må ikke træffe bindende complianceafgørelser eller sende fortrolige regnskabsdata til uvedkommende.
- [ ] Adgangskontrol, samtykke/oplysningspligt, begrænset logning, opbevaring/sletning og tests for prompt-injektion samt adgang på tværs af organisationer.
- [ ] End-to-end test: besvaret FAQ, ukendt spørgsmål, compliance-eskalering, fejlet eskalering, sagsnummer og tilbagemelding til kunde før pilotstart.

## Trin F – 30 dages pilot
- [ ] Morten kontakter de fem interesserede virksomheder og får skriftlig accept af rammer.
- [ ] Aftal virksomhedens kontaktperson og lovligt datagrundlag.
- [ ] Dag 1–7: sikker onboarding og datakontrol.
- [ ] Dag 8–14: observationer og manuel verifikation med kunden.
- [ ] Dag 15–21: anbefalinger og opfølgning.
- [ ] Dag 22–30: feedback, dokumenteret effekt og beslutning om fortsættelse.
- [ ] Gratis pilot uden automatisk overgang til betalingsabonnement.

## Fælles beslutningspunkt
**Pilot med rigtige data må først begynde, når Trin 0, 0B og A–E er gennemgået og godkendt. Partner Hub, de fem kunders tilknytning til Morten og en testet chatbot med fungerende compliance-eskalering er ufravigelige adgangskriterier, på linje med datasikkerheden.**
