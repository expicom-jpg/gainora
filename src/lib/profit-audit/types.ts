export type FinancialRow = {
  account: string;
  description: string;
  amount: number;
};

export type AuditFinding = {
  findingType: string;
  title: string;
  description: string;
  estimatedAnnualValue?: number;
};
