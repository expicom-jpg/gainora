# Gainora: automatiseret værdimotor — implementeringskontrakt

## Produktregel
Gainora udfører arbejdet; kunden godkender væsentlige beslutninger. Ingen beregnet forskel må præsenteres som dokumenteret, realiseret eller Gainora-tilskrevet besparelse uden efterprøveligt grundlag.

## Pipeline
1. Indlæs data fra godkendte integrationer, med tenant-isolation, datakilde, periode og provenance. Brug kun syntetiske data i pilot, indtil REAL_CUSTOMER_DATA_READY er godkendt.
2. Normalisér leverandør, vare/tjeneste, enhed, valuta, moms, mængde, tidsperiode og kontraktvilkår. Registrér usikkerhed og match-kvalitet.
3. Opdag ændringer og muligheder; deduplikér på virksomhed, periode, datakilde og mulighedsnøgle.
4. Vis beregning, antagelser, evidens, risiko og anbefalet handling. Kunden godkender handlingen, ikke en vilkårlig gevinst.
5. Opret handling med ejer, deadline, status, opfølgning og leverandørmuligheder. Ingen leverandørkontakt, aftaleændring eller betaling uden udtrykkelig autorisation.
6. Mål efterfølgende sammenlignelige enhedspriser og mængder, justér for mix, sæson, valuta, engangsforhold og ændret aktivitet. Gem baseline og resultater med kildehenvisninger.
7. Adskil **potentiale**, **beregnet forskel**, **verificeret realiseret besparelse** og **Gainora-attribution**. Sidstnævnte kræver kausal begrundelse, dokumentation og audit trail.
8. Leverandørviden må kun forbedres på tværs af kunder via lovligt, aggregeret og tilstrækkeligt anonymiseret grundlag; ingen fortrolige kundevilkår deles.

## Før produktionsrelease
- Backend-beregning og validering skal være autoritativ; klientberegninger er kun forhåndsvisning.
- Blokér ugyldige/negative tal, uens perioder, manglende valuta og manglende evidens.
- Indfør idempotensnøgler, audit events, tilladelser, fejlhåndtering og automatiske tests.
- Opret separat workflow til godkendte handlinger, datakildekoblinger og automatisk opfølgning.
- Erstat demoens manuelle dokumentationsformular med automatisk kildebaseret måling; manuel fallback skal mærkes 'ikke verificeret'.

## Status
Første lille UI-ændring i denne PR: foreløbig forskel udregnes automatisk i stedet for at brugeren selv indtaster 'Tilskrevet Gainora'. Det er ikke en færdig automatisk værdimotor og må ikke frigives som sådan.
