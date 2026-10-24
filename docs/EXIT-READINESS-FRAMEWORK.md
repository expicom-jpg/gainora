# Gainora — Exit Readiness Framework

**Status:** Styringsramme og kvalitetskrav, ikke dokumentation for opnåede resultater.

## Mål
Byg en overdragelig, sikker og skalerbar virksomhed med Customer, Partner og Supplier Network. Et muligt exit på 75–100 mio. DKK er en ambition, ikke en garanteret værdiansættelse. Prioritér kundeværdi og holdbar enhedsøkonomi frem for kosmetisk omsætning.

## Exit-kvalitetskrav ved hver release

1. **Dokumenteret kundeværdi:** Knyt anbefaling til datakilde, beregningsmetode, godkendelse, gennemført handling og verificeret resultat. Adskil potentiale fra realiseret værdi.
2. **Kontrakter:** Versioner kundevilkår, partneraftaler og leverandøraftaler. Registrér gyldighed, ophør, provisionsgrundlag, dataadgang, ændringer og eventuel overdragelighed. Få juridisk gennemgang før produktion.
3. **Indtægtskontrol:** Adskil SaaS-betalinger, partnerprovision og leverandørprovision. Beregn kun provision på kontraktligt berettigede, verificerede transaktioner; håndtér refunds og kreditnotaer. Idempotens, revisionsspor og månedlig afstemning.
4. **Sikkerhed og databeskyttelse:** Tenant-RLS, least privilege, audit logs, backup/restore-test, databehandleraftaler, slette- og retentionregler, hændelsesberedskab. Ingen rigtige kundedata før readiness-gates.
5. **Overdragelig drift:** Skriftlige runbooks, deployment- og rollback-procedurer, overvågning, dokumenteret arkitektur, leverandørafhængigheder, IP- og licensoversigt. Undgå ejerafhængige manuelle processer.
6. **Målbar økonomi:** KPI'er har ejer, definition, kilde, opdateringsfrekvens og afstemning mod regnskab. Ingen sammenblanding af GMV, bruttoomsætning, nettoomsætning og dækningsbidrag.

## Månedligt ledelsesdashboard (definitioner)

| KPI | Definition | Formål |
| --- | --- | --- |
| SaaS MRR | Normaliseret tilbagevendende abonnementsomsætning ekskl. moms, fratrukket aktive rabatter | Gentagelig indtægt |
| SaaS ARR | SaaS MRR × 12; ikke faktisk årsomsætning | Sammenlignelig run rate |
| Gross revenue retention | (Start-MRR − churn − contraction) / start-MRR | Fastholdelse uden opsalg |
| Net revenue retention | (Start-MRR − churn − contraction + expansion) / start-MRR | Vækst i eksisterende base |
| Logo churn | Mistede betalende kunder / betalende kunder ved periodestart | Kundestabilitet |
| CAC | Allokerede salgs- og marketingudgifter / nye betalende kunder | Anskaffelsesøkonomi |
| Gross margin | (Nettoomsætning − direkte leveringsomkostninger) / nettoomsætning | Unit economics |
| Partner payout ratio | Optjent partnerprovision / provisionsberettiget SaaS-nettoomsætning | Kanaløkonomi |
| Supplier GMV | Dokumenterede provisionsberettigede kundeindkøb, **ikke** Gainora-omsætning | Handelsvolumen |
| Supplier commission earned | Optjent provision på verificerede betalte køb, netto efter kreditnotaer | Indtægtsgrundlag |
| Supplier commission collected | Faktisk modtagne provisionsbetalinger | Kontant realisering |
| Reconciliation coverage | Afstemte køb / alle identificerede relevante køb | Datakvalitet |
| Verified customer value | Realiserede forbedringer med før/efter-grundlag og dokumentation | Produktets effekt |

**Krav:** Vis dataperiode, definition, eventuelle mangler og metodeændringer. Beregn ikke KPI'er ud fra ufuldstændige data uden tydelig markering.

## Dokumentationspakke til due diligence

- Selskabsstruktur, ejerbog, kapitalforhold, bestyrelses-/ledelsesbeslutninger.
- Kontrakter: kunder, partnere, leverandører, software, databehandlere og IP-overdragelser.
- Økonomi: månedlig P&L, balance, cash flow, faktura- og betalingsafstemning, deferred revenue, provisionsforpligtelser.
- Kunde- og kanaldata: kohorter, retention, churn, CAC, kundekoncentration, dokumenteret kundeværdi.
- Produkt: arkitektur, tests, CI/CD, sikkerhedsrevisioner, incident logs, integrationer, datakvalitet.
- Kommerciel risiko: kontrakters opsigelighed/overdragelighed, leverandørkoncentration, regulatoriske forhold, skatte- og momsbehandling.

## Prioriteret implementering

**Nu:** Fastlæg KPI-definitioner og evidenskrav, versionsstyr kontraktskabeloner, dokumentér økonomiske datakilder. Færdiggør anbefalingsmotoren og kundeoplevelsen.

**Før pilot med virkelige data:** Verificér DPA'er, dataregion, backup/restore, adgangskontrol, RLS, retention og hændelsesberedskab. Juridisk gennemgang af leverandørprovision, samtykke/datadeling og afregning.

**Efter verificeret pilot:** Automatisér partner- og supplier-ledgers, afstemning, alerts og rapportering; vis realiserede resultater frem for estimater.

**Før international skalering:** Lokal moms/skat, valuta, kontraktjurisdiktioner, datastrømme og økonomirapportering.

## Beslutningsregel

En funktion prioriteres højere, hvis den (a) forbedrer dokumenteret kundeværdi, (b) øger fastholdelse eller verificerbar gentagelig indtjening, (c) reducerer risiko eller ejerafhængighed, eller (d) gør platformen lettere at overdrage. Vækst uden sund økonomi eller tillid tæller ikke som exit-parathed.
