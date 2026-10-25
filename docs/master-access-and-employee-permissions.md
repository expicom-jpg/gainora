# Gainora Master Access – eneste ejer og godkendelsesflow for alle ansatte

**Status: obligatorisk kravspecifikation – ikke implementeret eller testet.**

## Grundregel
Gainora har **præcis én Master-bruger**, tilknyttet ejerens verificerede personlige login. Ingen anden medarbejder, partner eller admin kan få Master-rollen, overtage den, delegere den eller tildele sig selv rettigheder. Master kan tildele, ændre, suspendere og fratage alle medarbejderrettigheder på tværs af Gainora.

Masterrollen skal være beskyttet af dokumenteret stærk identitetskontrol og phishing-resistent MFA, hvor muligt. Backup/recovery skal være en særskilt verificeret sikkerhedsprocedure, der ikke skaber en anden aktiv Master-konto.

## Master-side: Medarbejdere og rettigheder
- Særskilt `/master/access`-side, kun tilgængelig for Master med server-side kontrol.
- Opret eller invitér en navngiven medarbejder: navn, e-mail, evt. afdeling, stilling, status.
- Enhver ny **ansat** starter i `pending_master_approval` med **nul rettigheder** til interne systemer. At have et login giver ikke i sig selv adgang.
- Master ser en formular med afkrydsningsfelter for konkrete rettigheder, opdelt efter område, og aktivt godkender de valgte rettigheder. **Ingen felter er krydset af på forhånd**.
- Eksempel på uafhængige rettigheder: Partner Hub læsning, partneradministration, kunde-onboarding, salgsdata, provision læsning, provision administration, Compliance Portal læsning, Compliance svar, Compliance søgning/historik, Compliance sags-eksport, chatbot-vidensgodkendelse, økonomirapporter, teknisk drift og indstillinger.
- Compliance-adgang og kundedialog tildeles aldrig automatisk via andre rettigheder, herunder normal `admin`, `partner` eller `manager`; Master må udtrykkeligt krydse dem af.
- En medarbejder kan have flere individuelle rettigheder, men **ingen ansat** kan administrere rettighedstildelinger til sig selv eller andre. Master styrer også senere ændringer.
- Ved ændring vises aktuelle rettigheder og ændringer (tilføjet/fjernet) til bekræftelse. Master kan straks blokere bruger, tilbagekalde samtlige rettigheder og annullere aktive sessioner.
- Statusfelt: `invited`, `pending_master_approval`, `active`, `suspended`, `revoked`; kun `active` + eksplicitte tilladelser får adgang.

## Adgangsteknisk håndhævelse
- Én verificeret auth-bruger-ID som Master. Begræns Master-unikhed med databaseinvariant og godkendt bootstrap, ikke kun UI. Andre roller og services må aldrig kunne skrive Master-attributten.
- Oprettelse af ansat skaber alene en identitet/invitation, ikke automatisk funktionelle tilladelser. Ingen default-grupper, rolle-arv eller selvregistrering til intern adgang.
- Master-godkendelse lagres som signeret/auditerbar hændelse med master_user_id, employee_user_id, præcist rettighedssæt, tidspunkt og version. En ansat må ikke aktivere sig selv via direkte API eller ændre tokenclaims.
- Hver beskyttet serverhandling kontrollerer en aktuel, aktiv adgangstildeling; RLS for både medarbejderrettigheder og kundedata. Revokering skal virke uden at vente på udløb af længe cached adgangstokens.
- Adskil ansatte fra eksterne partner- og kundebrugere: deres almindelige kunde-login berøres ikke af medarbejderformularen, men de får ingen adgang til interne områder. Også interne Partner Hub-roller oprettes under Masterkontrol.
- Audit af oprettelse, godkendelse, afvisning, rettighedsændringer, login til følsomme områder, adgangsforsøg, eksport og tilbagekaldelse. Revision må ikke ændres af almindelige brugere.
- Gennemfør regelmæssig rettighedsgennemgang og definér sikker nødprocedure for kontolåsning – uden uautoriseret Masterovertagelse.

## Acceptance tests / launch-blocker
- [ ] Der findes præcis én aktiv Master-bruger; hverken andre admins, support, partnere eller medarbejdere kan skabe eller tildele Master.
- [ ] Medarbejderinvitation + login uden Masterafkrydsning giver nul adgang til alle interne sider og API'er.
- [ ] Master kan sætte individuelle flueben for præcise funktioner og aktivere medarbejderen.
- [ ] Rettighedsfelter er umarkerede ved ny oprettelse, og godkendelseshandlingen er eksplicit.
- [ ] Compliance-området kræver særskilt flueben; Partner Hub-adgang giver ikke Compliance-adgang.
- [ ] Master kan ændre/fjerne rettigheder og suspendere en medarbejder straks, også for aktive sessioner.
- [ ] Direkte API- og databaseadgangstest beviser default-deny og ingen selv-eskalering.
- [ ] Audit er søgbart for Master, med hvem/hvad/hvornår for hver godkendelse og tilbagekaldelse.
- [ ] Masterkontogendannelse er dokumenteret og gennemprøvet med stærk identitetskontrol.

Bemærk: eksisterende onboarding-krav i Partner Hub og Compliance Portal må ikke tolkes som automatisk ansat-godkendelse. **Master skal personligt godkende alle ansatte før intern systemadgang.**
