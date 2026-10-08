# Gainora — ét økosystem, tre netværk

**Status:** Produktstrategi og fremtidig arkitektur. Beskriver ikke færdigimplementerede funktioner.

## Fælles principper

- Kunden skal opnå dokumenterbar økonomisk værdi. Anbefalinger rangeres efter kundens samlede økonomiske og kvalitative fordel — aldrig efter Gainoras provision.
- Alle kommercielle relationer og betalinger oplyses tydeligt. Kundedata deles kun på et gyldigt grundlag og med passende tilladelser.
- Ingen antagede besparelser præsenteres som realiserede. Skeln mellem observation, beregning, hypotese og verificeret resultat.
- Adskilte adgangsrettigheder, tenant-isolation, revisionsspor og dataminimering.
- Ingen provision uden kontraktligt grundlag og verificerbar transaktion; kreditnotaer og tilbageførsler håndteres.

## Customer Network

Virksomheder abonnerer på Profit Intelligence, får økonomiske analyser, prioriterede handlinger og verificerede alternative tilbud. Kunden godkender selv leverandørskift. Mål: dokumenteret forbedring, ikke antal dashboards.

## Partner Network

Partnere skaffer kunder til Gainora. Attribution registreres ved oprettelse, provisionsvilkår versioneres, og udbetaling knyttes til faktisk modtagne abonnementsbetalinger med korrektion for refunds. Partneren må kun se egne relationer og provisioner.

## Supplier Network

Gainora matcher kundens dokumenterede indkøbsbehov med tilbud og leverandører. Leverandørerne betaler en aftalt løbende provision på provisionsberettigede **betalte nettoindkøb ekskl. moms**, medmindre en specifik aftale angiver et andet grundlag. Procentsats er aftalespecifik, ikke universel.

### Hændelses- og afregningsflow

1. Registrér formidlet kunde–leverandør-relation med gyldighedsperiode, provisionssats, kontraktversion og samtykke/grundlag.
2. Indlæs leverandørens salgsrapporter og kundens bogførte leverandørfakturaer via autoriserede integrationer. Gem kilde, ekstern reference, periode og importstatus.
3. Match på leverandøridentitet, kunde, fakturanummer, beløb, valuta og dato; markér tvivlsomme matches til gennemgang.
4. Afstem kreditnotaer, returneringer, betalinger og eventuelle valutaforskelle. Undgå dobbelttælling med idempotente transaktionsnøgler.
5. Beregn provision ud fra aftalens gyldige vilkår og verificeret betalingsstatus. Hold `beregnet`, `optjent`, `faktureret`, `betalt` og `forfaldent` adskilt.
6. Generér månedligt fakturagrundlag og afstem indbetalinger. Opret ikke automatisk bindende fakturaer uden korrekt juridisk, skatte- og integrationsmæssigt setup.
7. Log hver korrektion med tidspunkt, kilde og årsag. Understøt genberegning ved sene kreditnotaer.

### Automatiske advarsler

| Signal | Datagrundlag | Foreslået handling |
| --- | --- | --- |
| Manglende rapportering | Forventet rapporteringsdato passeret | Ryk leverandøren og markér uafstemt periode |
| Usædvanligt fald i indkøb | Sammenlignelige perioder og sæsonkorrigeret historik | Undersøg kundetab, datamangler eller reelt lavere forbrug |
| Uoverensstemmelse | Kundens fakturaer mod leverandørens rapportering | Vis differencer og dokumentation til afstemning |
| Forsinket afregning | Fakturaens forfaldsdato og verificeret betaling | Send påmindelse og eskalér efter aftalt proces |

Advarsler skal have tærskler, deduplikering, prioritet, ansvarlig og løst-status. Manglende data er ikke bevis for snyd.

## Fælles datamodel (plan)

- `organizations`, `network_memberships` og rollebaserede rettigheder
- `partner_attributions`, `subscription_payment_events`, `partner_commission_ledger`
- `suppliers`, `supplier_offers`, `supplier_agreements`, `customer_supplier_attributions`
- `supplier_invoice_lines`, `supplier_sales_reports`, `purchase_matches`, `supplier_payment_events`
- `supplier_commission_ledger`, `supplier_settlements`, `reconciliation_alerts`
- `recommendation_evidence`, `recommendation_outcomes`, `audit_events`

Fælles identitet og rapportering; **separate** provisionsgrundlag og ledger for partner- og leverandørnetværket. Implementér ikke nye tabeller uden migrationer, RLS-tests og adgangskontrol.

## Udviklingsrækkefølge

1. Færdiggør kundeanalysen og den evidensbaserede anbefalingsmotor.
2. Implementér verificerbare alternative leverandørtilbud med totalomkostning og kundegodkendelse.
3. Byg supplier attribution og dobbeltkilde-afstemning på syntetiske data.
4. Byg idempotent provisionsledger, månedlig afregning og advarsler.
5. Pilot med få kunder og leverandører efter kontrakter, databeskyttelse og sikkerhedskontrol.
6. Skalér partner- og supplier-netværk efter dokumenteret værdi og enhedsøkomomi.

**Kvalitetsport:** Ingen produktionsaktivering med virkelige kundedata før nødvendige aftaler, databeskyttelse, RLS, backup/restore, retention og afregningskontroller er verificeret.
