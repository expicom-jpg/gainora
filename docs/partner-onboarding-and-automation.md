# Gainora Partner Hub – løbende selvbetjent onboarding af partnere

Status: **kravspecifikation – ikke implementeret/godkendt**. Supplerer Partner Hub PR #77. Nye partnere skal kunne integreres i drift uden kodeændringer og uden manuel oprettelse af kundedatabaser.

## Partnerlivscyklus
1. Gainora-admin opretter partner med firmanavn/person, kontakt, land, sprog, status, kommerciel aftaleversion og evt. introducer/rekrutterende partner. Alternativt: offentlig partneransøgning med manuel accept før aktivering.
2. Systemet tildeler et **unikt, uforanderligt partner-ID**, opretter en inaktiv invitation, gemmer revisionsspor og sender invitation via konfigureret mailsystem. Ingen falsk bekræftelse ved manglende leverance.
3. Modtageren accepterer invitation, opretter/login'er med sikker autentifikation, verificerer mail og accepterer gældende vilkår.
4. Efter verificeret admin-godkendelse aktiveres partnerrollen og partnerens eget dashboard, leadpipeline, kundeoversigt og relevante salgsressourcer automatisk. Brugeren må ikke selv kunne tildele sig partner/admin-rolle.
5. Partneren kan oprette/invitere leads og virksomheder gennem server-side ejerskabstildeling. Attributér kunden til partner-ID ved første oprettelse; konvertering fra gratis pilot til betaling ændrer ikke attribution.
6. Admin kan suspendere, genaktivere, ændre vilkår med fremadrettet ikrafttræden og håndtere ejerskabsoverdragelse med godkendt proces og audit-log. Eksisterende historik bevares.
7. Partner-dashboard viser kun lovlige salgs-/onboardingoplysninger. Adgang til fakturaer, Profit Audit, support-/compliance-sager, chatlogs og kunders rå regnskabsdata kræver særskilt rettighed og grundlag.

## Minimal datastruktur
- partners: id, display_name, legal_entity, status (pending/invited/active/suspended), country, locale, introducer_partner_id, created_at, approved_at.
- partner_memberships: partner_id, auth_user_id, role (owner/member), status; role tildeles udelukkende serverside af admin-proces.
- partner_invites: invitation_id, partner_id, recipient, expiring single-use token hash, state, sent_at, accepted_at.
- partner_agreements: partner_id, agreement_version, signature/acceptance, effective_from, commission_plan_id.
- partner_customer_attributions: partner_id, org_id, attributed_at, attributed_by, immutable origin plus audit trail for permitted reassignment.
- partner_leads: partner_id, org/contact minimal details, status, consent basis, owner; no raw customer financial data.
- partner_commission_ledger: partner_id, subscription/payment ID, event type, currency, eligible amount, contractual rate snapshot, reversal references; idempotent, reconciliation required before payout.

## Automatiske integrationer (godkendt partner)
- Opret membership og dashboard efter invitation/godkendelse, uden deployment.
- Tilføj partnerrettigheder kun efter serverside-godkendelse; isolér hver partner med RLS.
- Stil partnerens unikke invitationslink/kode til rådighed til leads og kundetilknytning, med misbrugsforebyggelse og mulighed for admin-korrektion.
- Tilskriv efterfølgende betalte abonnementer og godkendte add-ons til korrekt partner-ID ved faktiske betalingshændelser. Gratis pilot udløser ikke provisionsudbetaling.
- Send adviseringer om nyt lead, pilotstart og konvertering via konfigurerede kanaler med dataminimering.
- Integrér med supportchat: botten kan svare generelt; support-/compliance-sager ejes af rette kø og deles ikke automatisk med partneren.

## Skalerings- og sikkerhedskrav
- Understøt mange partnere, flere brugere hos en partner og flere kunder pr. partner.
- Unikke partner-ID'er og databasesikret én aktiv attributering pr. kunde efter besluttet model; idempotente invitationer/onboarding/webhooks.
- Negativ RLS-test: partner A må ikke læse eller ændre partner B's medlemmer, leads, kunder, salgsdata eller provision.
- Geninvitation, udløbet link, allerede eksisterende bruger, suspenderet partner og dubleret kunde håndteres eksplicit.
- Ikke nogen automatisk overførsel af eksisterende kunder mellem partnere uden administrativ afgørelse og revisionsspor.
- Introducer-/underpartnerstrukturer skal understøttes uden at give adgang til underpartneres fortrolige kundedata.
- Kommissionsprocenter er konfigurerbare per aftale/version; aldrig hårdkodet eller lovet før underskrevet aftale.

## Krævede accepttests inden de første piloter
- [ ] Morten inviteres/godkendes og får aktivt Partner Hub-login uden kodeændring.
- [ ] Alle fem pilotvirksomheder knyttes korrekt til Mortens partner-ID fra oprettelse.
- [ ] En **anden testpartner** kan oprettes med samme flow og får et isoleret dashboard uden adgang til Mortens data.
- [ ] Nye partnere og virksomheder kræver ikke særskilt softwaredeployment eller manuel SQL.
- [ ] Gratis pilot -> betalt abonnement bevarer ejerskabet; provision følger kun modtagne betalinger og underskrevne vilkår.
- [ ] Forkerte/udløbne invitationer, dubletter, suspendering og overdragelse håndteres sikkert.
- [ ] Adgang til kunders fakturaer og compliance-sager er lukket som standard.
- [ ] Revision, RLS, GDPR og fuld onboarding gennemgået og godkendt med syntetiske testdata.
