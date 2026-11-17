# Gainora – verificerbare gates før pilot med rigtige data

Status: **IKKE GODKENDT**. Dette dokument er en tjekliste, ikke dokumentation for beståede tests.

## P0 – CI og dependencies
- [ ] TypeScript typecheck, Vitest og production build består på den præcise release-commit.
- [ ] Dependency audit: ingen uafklarede kritiske/høje fund; dokumentér versioner og evt. risikogodkendelser.
- [ ] Gem links til workflow-runs, testlogs og reviewer i release-notat.

## P0 – Adgangskontrol og isolation
- [ ] Hosted Supabase i valgt EU-region og korrekt miljøadskillelse.
- [ ] RLS aktiveret på **alle** tenant-tabeller og private objekter.
- [ ] Negative integrationstests: bruger i organisation A kan ikke læse, ændre, slette eller eksportere organisation B's data.
- [ ] Test uden medlemskab, udløbet session, slettet medlemskab og privilegieeskalering.
- [ ] Service-role-nøgler kun på serveren; ingen hemmeligheder i browser eller logs.
- [ ] Master Control og Partner Hub: dokumenterede roller, godkendelser og uafhængige negative tests.

## P0 – Sikker import og datahåndtering
- [ ] CSV/XLSX: filstørrelse, filtype, parsergrænser, ugyldige værdier og fejlrapportering.
- [ ] Upload-preview er adskilt fra endelig import; commit kræver eksplicit autorisation.
- [ ] Idempotent import og beskyttelse mod dubletter; tenant-scope verificeret.
- [ ] Privat storage, sletning/retention og sletning af originalfil testet.
- [ ] Audit events for import, ændringer, godkendelser og eksport – uden hemmelige data.

## P0 – Privatliv og drift
- [ ] Databehandleraftaler, underdatabehandlere og dataflow kortlagt.
- [ ] Backup/restore testet; hændelsesberedskab og kontaktperson udpeget.
- [ ] Pilot-allowlist for præcis fem godkendte virksomheder.
- [ ] Synthetic end-to-end dry run: onboarding → import → Profit Audit → godkendelse → resultat.
- [ ] Dokumenteret ejerbeslutning før REAL_CUSTOMER_DATA_READY aktiveres.

## P1 – Produktkvalitet (må ikke blokere P0)
- [ ] Profit Audit: deterministiske KPI'er med tests og sporbar kilde.
- [ ] Scenarier: tydeligt markeret som hypotetiske, ikke verificerede gevinster.
- [ ] Anbefalinger: menneskelig godkendelse før handling.
- [ ] Resultatmåling: baseline, tidsperiode, metode og evidens.
- [ ] AI-assistent: minimal datadeling, ingen autonom økonomisk handling.

## Reviewlog
| Gate | Evidenslink | Reviewer | Dato | Resultat |
| --- | --- | --- | --- | --- |
| CI og audit | Afventer | – | – | Ikke godkendt |
| RLS/isolation | Afventer | – | – | Ikke godkendt |
| Import/storage | Afventer | – | – | Ikke godkendt |
| Privacy/drift | Afventer | – | – | Ikke godkendt |
| Pilot dry run | Afventer | – | – | Ikke godkendt |

**Regel:** Manglende evidens = ikke bestået. Ingen produktion, migration eller rigtige kundedata via dette dokument alene.
