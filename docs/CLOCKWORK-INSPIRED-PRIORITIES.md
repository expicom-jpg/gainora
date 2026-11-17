# Gainora: inspiration fra Clockwork (ikke en kopi)

Kilde: https://www.clockwork.ai/ (gennemgået 17. november 2026). Clockwork beskriver finansielt dashboard, finansiel modellering, AI-analytiker, headcount planning og ugentlige cash-flow-prognoser. Deres markedsføring er ikke dokumentation for vores egne funktioner.

## Prioritering og beslutninger

1. **Hvad-nu-hvis-scenarier (P1)**: første, isolerede beregningsmotor i `src/lib/profit-audit/scenarios.ts` med tests. Input er månedlig omsætning/omkostninger og procentvise ændringer. Output er illustrative ændringer i resultat og margin. Ikke live prognoser eller verificerede besparelser.
2. **Forklarende dashboard (P1)**: byg oven på eksisterende Profit Audit og månedstal. Adskil observerede data, hypotetiske scenarier og verificerede effekter.
3. **AI-økonomiassistent (P2)**: begrænset til adgangskontrollerede organisationsdata, minimale prompts, kildeangivelse og menneskelig godkendelse. Ingen frie databaseforespørgsler eller autonome ændringer.
4. **Likviditetsprognose (P2)**: kræver faktiske forfaldsdatoer, ind-/udbetalinger og åbningssaldo. Regnskabsmæssigt resultat alene er utilstrækkeligt.
5. **Bemandingsscenarier (P3)**: først når tids-/aktivitetsdata og persondatavurdering er på plads.
6. **Regnskabsintegrationer (P2)**: fortsat efter sikkerhedsreview og eksplicit samtykke; ikke et alternativ til sikre importkontroller.

## Release gates

Ingen pilot med reelle kundedata før hosted RLS, negative autorisationstests, import-sikkerhed og godkendt readiness. Scenariemotoren er kun en ren beregningsfunktion og er endnu ikke koblet til dashboard eller API. Ingen migrations, integrationer eller produktion er ændret. Få CI og sikkerhedsreview godkendt før merge.

## Gainoras differentiering

Clockwork fokuserer på økonomisk planlægning og analyse. Gainora skal forbinde **Profit Audit → prioriteret anbefaling → kundegodkendt handling → eftermåling med dokumentation**. Potentialer må aldrig præsenteres som realiserede besparelser.
