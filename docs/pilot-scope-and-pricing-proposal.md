# Gainora – pilot og prisstrategi (beslutningsoplæg, 17. november 2026)

**Kun forslag.** Ingen produktionsændring, kundelancering eller godkendt prisændring.

## Sikkerhed før pilot
1. Samlet integrationsgren med eksakt-head CI: database, kvalitet og security audit.
2. Dokumentér RLS i isoleret Supabase/PostgreSQL-testmiljø med to autentificerede virksomheder, anonym/manglende identitet og SELECT/INSERT/UPDATE/DELETE; undersøg service-role bypass.
3. Negative adgangstests for Master Control og Partner Hub: rettighedseskalering, selv-godkendelse, adgang på tværs af kunder samt audit trail.
4. Sikker Excel/CSV-import: filstørrelse, MIME/type, formelinjektion, ugyldige kolonner, lagring og sletning.
5. Gennemgå hemmeligheder, dataopbevaring, databehandleraftaler og beredskab. Kræv eksplicit godkendelse før produktionsmigration eller rigtige kunder.

**Verificeret delresultat:** PR #98 commit b4f02f9 bestod GitHub CI #299 (database, quality, security_audit), og tilhørende Vercel-preview er READY. Dette er ikke en samlet pilotgodkendelse.

## Minimal pilotversion
Behold: sikker kundeadskillelse, adgangsroller, valideret Excel-import, Profit Audit, prioriterede anbefalinger med beregningsgrundlag, kundegodkendelse og audit. Udskyd automatisk bogføring, bankforbindelser, betalingsudførelse, avanceret chatbot og Ventora. Gainora skal forbedre dokumenterbart overskud, ikke kopiere et bogføringsprogram.

## Prisforslag til test – DKK/måned ekskl. moms
| Model | Pris | Indhold (forslag) |
| --- | ---: | --- |
| Entry | 995 | Begrænset antal analyser og manuel import |
| Growth | 1.495 | Løbende Profit Audit, prioriterede forslag og opfølgning |
| Pro | 2.495 | Udvidet analyse og dokumentation af forbedringer, tydelige brugsgrænser |

Alternativt én kernepakke til 1.495 eller 2.495 afhængigt af pilotdata. 2.495/måned er 29.940/år ekskl. moms. Estimerede gevinster må aldrig fremstilles som realiserede. Ingen ubegrænset AI eller konsulenttid uden omkostningsmodel.

## Beslutningsgrundlag
- Spørg fem piloter om betalingsvillighed ved 995 / 1.495 / 2.495 og hvilke konkrete gevinster de forventer.
- Mål hosting, AI-forbrug, storage, onboarding, support, salgsprovision og betalingsgebyrer pr. kunde.
- Følg forventede kontra faktisk realiserede besparelser og kundens tidsforbrug.
- Pris og pakkeindhold besluttes først efter dokumentation og eksplicit godkendelse.
