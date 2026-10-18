import type { AuditDetail } from "./analysis";
import { costReductionScenario } from "./analysis";

export type Recommendation = {
  id: string;
  title: string;
  observation: string;
  actions: string[];
  evidence: "observed" | "calculated" | "hypothesis";
  dataNeeded: string[];
  scenario: { baseAmount: number; reductionPct: number; potential: number; label: string } | null;
  validation: string;
  signals: string[];
};

const norm = (s: string) => s.toLocaleLowerCase("da-DK");
const purchasing = /vare|indkøb|indkoeb|råvare|raavare|supplier|leverandør|leverandoer/;
const payroll = /løn|loen|salary|wage|personale/;
const recurring = /abonnement|software|tele|forsikring|leasing|husleje|rent|subscription/;
const dkk = (n: number) => new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(n);

function recommendation(id: string, title: string, observation: string, actions: string[], dataNeeded: string[], base: number, validation: string): Recommendation {
  return {
    id, title, observation, actions, dataNeeded,
    evidence: "observed",
    scenario: base > 0 ? { baseAmount: base, reductionPct: 1, potential: costReductionScenario(base, 1), label: "Illustration: 1 % lavere omkostning på denne kontogruppe – ikke et dokumenteret besparelsespotentiale." } : null,
    validation,
    signals: []
  };
}

/** Conservative, deterministic action ideas. Never presents hypothetical savings as proven. */
export function generateRecommendations(detail: AuditDetail): Recommendation[] {
  const groups = [
    { id: "purchasing", title: "Sammenlign priser og forbrug på de største indkøb", pattern: purchasing,
      actions: ["Find de 10 største varegrupper eller leverandører fra fakturalinjer.", "Sammenlign enhedspriser, mængder, fragt og rabatter på ens varer.", "Indhent tilbud på varer med dokumenteret prisforskel."],
      dataNeeded: ["Leverandørfakturaer med varelinjer", "Mængder og enhedspriser", "Leverandør- og kontraktvilkår"],
      validation: "Mål faktiske enhedspriser og købte mængder før og efter ændringen." },
    { id: "payroll", title: "Sammenhold bemanding med aktivitet", pattern: payroll,
      actions: ["Sammenlign lønudgifter og omsætning måned for måned.", "Kortlæg overarbejde, vagtplaner og faktisk aktivitet.", "Undersøg konkrete afvigelser før ændringer i bemandingen."],
      dataNeeded: ["Vagtplaner og arbejdstimer", "Omsætning eller aktivitetsmål per periode", "Overarbejde og tillæg"],
      validation: "Mål produktivitet og lønudgifter i sammenlignelige perioder uden at antage, at lavere løn altid er bedre." },
    { id: "recurring", title: "Gennemgå faste aftaler og abonnementer", pattern: recurring,
      actions: ["Lav en liste over aftaler og fornyelsesdatoer.", "Sammenhold betalinger med faktisk brug og dobbeltlicenser.", "Undersøg opsigelse eller genforhandling, når vilkårene tillader det."],
      dataNeeded: ["Kontrakter og bindingsperioder", "Fakturaer", "Faktisk licens- eller ydelsesforbrug"],
      validation: "Dokumentér opsagte eller genforhandlede aftaler og efterfølgende betalte beløb." }
  ] as const;
  return groups.flatMap(group => {
    const matching = detail.accounts.filter(a => group.pattern.test(norm(a.account)));
    const amount = matching.reduce((sum,a) => sum+a.amount,0);
    if (amount <= 0) return [];
    const signals: string[] = [];
    if (detail.costs > 0) {
      const share = amount / detail.costs * 100;
      signals.push(`Kontogruppen udgør ${share.toLocaleString("da-DK", {maximumFractionDigits: 1})} % af de importerede omkostninger. Dette er en koncentration, ikke en påvist besparelse.`);
    }
    const months = detail.monthly.filter(m => m.costs > 0 && m.revenue > 0);
    if (months.length >= 3) {
      const ratios = months.map(m => ({month: m.month, ratio: m.costs / m.revenue * 100}));
      const low = ratios.reduce((a,b) => a.ratio < b.ratio ? a : b);
      const high = ratios.reduce((a,b) => a.ratio > b.ratio ? a : b);
      if (high.ratio - low.ratio >= 5) {
        signals.push(`Samlet omkostningsandel varierer fra ${low.ratio.toLocaleString("da-DK", {maximumFractionDigits: 1})} % (${low.month}) til ${high.ratio.toLocaleString("da-DK", {maximumFractionDigits: 1})} % (${high.month}) af omsætningen. Udsvinget vedrører alle omkostninger og kan ikke tilskrives denne kontogruppe uden yderligere data.`);
      }
    }
    return [{...recommendation(group.id, group.title,
      `Importerede konti i denne gruppe: ${matching.map(a=>a.account).join(", ")}. Samlet udgift: ${dkk(amount)} i perioden.`,
      [...group.actions], [...group.dataNeeded], amount, group.validation), signals}];
  });
}
