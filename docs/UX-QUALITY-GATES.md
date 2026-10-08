# Gainora: UX-kvalitetskrav ved hver ændring

## Produktprincip
**Find → Forklar → Bevis**. Virksomhedsejeren skal kunne forstå økonomisk betydning og næste handling uden regnskabsfaglige forkundskaber. UX er et acceptkriterium, ikke en senere designfase.

## Obligatorisk kontrol ved hver PR
- [ ] Én primær handling per visning. Gentagne knapper og lange kortlister undgås.
- [ ] Start med overblik; detaljer vises først ved valg af et fund.
- [ ] Danske, forklarende tekster og statusser; tal med da-DK-formatering og tydelig valuta/periode.
- [ ] Alle beregnede beløb kan spores til datagrundlag. Hypoteser, estimater og dokumenterede resultater adskilles.
- [ ] Indlæsning, tomme resultater, manglende adgang og fejl har forståelige beskeder.
- [ ] Ingen vandret tekst-overløb på mobil eller desktop. Lange titler brydes, tabeller kan scrolles.
- [ ] Tastaturnavigation, synlig fokusmarkering, labels og semantiske knapper fungerer.
- [ ] Ændringer bevarer eksisterende godkendelser og resultatregistreringer.
- [ ] Typecheck, tests og build er grønne inden merge.
- [ ] Ændringer i adgang til økonomiske data respekterer organisationens RLS/tenant-isolation.

## Profit Audit – forventet arbejdsflow
1. Vælg virksomhed (forudvælg kun, når brugeren har adgang).
2. Se antal nye/godkendte/gennemførte fund og de vigtigste beløb.
3. Filtrér og vælg ét fund. Undgå at vise 24 fulde analyser samtidig.
4. Se observation, kildedata, usikkerhed, økonomisk betydning og konkret næste handling.
5. Godkend eller afvis på det valgte fund; dokumentér kun faktisk resultat med evidens.

## Målepunkter i piloten
- Tid fra åbning af Audit til første forståede anbefaling.
- Antal klik fra overblik til godkendt fund.
- Andel brugere, der kan forklare forskellen på estimat og dokumenteret besparelse.
- Fejl og frafald ved import, godkendelse og resultatregistrering.
- Mobil/desktop gennemgang med realistiske lange kontonavne og 24+ fund.

## Release-princip
En funktion er ikke færdig, blot fordi beregningen virker. Den er først klar, når en almindelig bruger kan finde, forstå og handle på resultatet, og de tekniske tests er grønne.
