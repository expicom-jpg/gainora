# Gainora – adgangskriterier for de første fem pilotvirksomheder

Status: Intern implementeringsplan. **Ikke godkendt til rigtige kundedata endnu.**

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
- [ ] Alle fem pilotvirksomheder knyttes til Mortens partner-ID ved oprettelse, før de får pilotadgang; ingen midlertidig ejer på Gainoras generelle konto.
- [ ] Kundetilknytningen er varig og auditerbar gennem invitation, 30 dages gratis pilot, eventuel betalt konvertering, tilkøb og opsigelse.
- [ ] Partnerdashboard viser kun Mortens egne kundeemner og virksomheder, kontaktpersoner, onboardingstatus, pilotstart/slut, opfølgning og aftalt kommerciel status.
- [ ] Partneren kan oprette/invitere et lead og se dets status; admin kan godkende oprettelse og styre ejerskab, inkl. registreret ændringshistorik.
- [ ] Server-side adgangskontrol og negative RLS-tests: en anden partner må ikke kunne se, ændre eller overtage Mortens kunder.
- [ ] Partnerrollen giver ikke som standard adgang til kunders fakturaer, økonomiske rådata eller analyser; eventuel deling kræver særskilt tilladelse.
- [ ] Provisionsgrundlag følger partnerrelationen ved senere aktivering af betalte abonnementer/tilkøb og kan afstemmes mod faktiske betalinger, tilbagebetalinger og opsigelser.
- [ ] Ingen provision udbetales på gratis pilot, og foreløbige provisionssatser må ikke beskrives som aftalt kontrakt.
- [ ] Partnerkonto, tildeling, visning, invitationsflow og pilot-til-betaling er testet med syntetiske virksomheder før første rigtige pilot.

## Trin E – 30 dages pilot
- [ ] Morten kontakter de fem interesserede virksomheder og får skriftlig accept af rammer.
- [ ] Aftal virksomhedens kontaktperson og lovligt datagrundlag.
- [ ] Dag 1–7: sikker onboarding og datakontrol.
- [ ] Dag 8–14: observationer og manuel verifikation med kunden.
- [ ] Dag 15–21: anbefalinger og opfølgning.
- [ ] Dag 22–30: feedback, dokumenteret effekt og beslutning om fortsættelse.
- [ ] Gratis pilot uden automatisk overgang til betalingsabonnement.

## Fælles beslutningspunkt
**Pilot med rigtige data må først begynde, når Trin A–D er gennemgået og godkendt. Partner Hub og de fem kunders tilknytning til Morten er ufravigelige adgangskriterier, på linje med datasikkerheden.**
