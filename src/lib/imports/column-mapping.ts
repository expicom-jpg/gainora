export type CanonicalField = "date" | "account" | "description" | "amount";

const aliases: Record<CanonicalField, string[]> = {
  date: ["date", "dato", "transaction date", "posting date", "bogføringsdato"],
  account: ["account", "konto", "account name", "kontonavn", "account number", "kontonr"],
  description: ["description", "text", "tekst", "beskrivelse", "memo"],
  amount: ["amount", "beløb", "beloeb", "value", "værdi", "vaerdi"]
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function suggestColumnMapping(columns: string[]) {
  const normalized = columns.map((column) => ({
    original: column,
    normalized: normalize(column)
  }));

  const mapping: Partial<Record<CanonicalField, string>> = {};

  (Object.keys(aliases) as CanonicalField[]).forEach((field) => {
    const match = normalized.find(({ normalized: column }) =>
      aliases[field].includes(column)
    );

    if (match) mapping[field] = match.original;
  });

  return mapping;
}

export function hasRequiredMapping(
  mapping: Partial<Record<CanonicalField, string>>
): mapping is Record<CanonicalField, string> {
  return Boolean(mapping.date && mapping.account && mapping.amount && mapping.description);
}
