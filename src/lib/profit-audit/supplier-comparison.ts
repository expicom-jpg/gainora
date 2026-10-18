/** Comparable supplier quotes only. All prices must be in the same currency and
 * refer to the same product specification and normalized quantity unit.
 * Quotes are supplied by the caller; this module never invents market prices.
 */
export type SupplierQuote = {
  supplier: string;
  productKey: string;
  currency: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  deliveryCost?: number;
};
export type QuoteComparison = {
  currentTotal: number;
  alternativeTotal: number;
  potentialDifference: number;
  comparable: true;
  verifiedSaving: false;
  caveat: string;
};
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const validText = (value: string) => typeof value === "string" && value.trim().length > 0;
function validate(quote: SupplierQuote) {
  if (![quote.supplier, quote.productKey, quote.currency, quote.unit].every(validText) ||
    !Number.isFinite(quote.unitPrice) || quote.unitPrice < 0 ||
    !Number.isFinite(quote.quantity) || quote.quantity <= 0 ||
    !Number.isFinite(quote.deliveryCost ?? 0) || (quote.deliveryCost ?? 0) < 0) {
    throw new Error("invalid_supplier_quote");
  }
}
export function compareSupplierQuotes(current: SupplierQuote, alternative: SupplierQuote): QuoteComparison {
  validate(current);
  validate(alternative);
  if (current.productKey.trim().toLocaleLowerCase("da-DK") !== alternative.productKey.trim().toLocaleLowerCase("da-DK") ||
    current.currency.trim().toUpperCase() !== alternative.currency.trim().toUpperCase() ||
    current.unit.trim().toLocaleLowerCase("da-DK") !== alternative.unit.trim().toLocaleLowerCase("da-DK") ||
    current.quantity !== alternative.quantity) {
    throw new Error("non_comparable_supplier_quotes");
  }
  const currentTotal = round(current.unitPrice * current.quantity + (current.deliveryCost ?? 0));
  const alternativeTotal = round(alternative.unitPrice * alternative.quantity + (alternative.deliveryCost ?? 0));
  if (!Number.isFinite(currentTotal) || !Number.isFinite(alternativeTotal)) throw new Error("invalid_supplier_quote");
  return {
    currentTotal,
    alternativeTotal,
    potentialDifference: round(currentTotal - alternativeTotal),
    comparable: true,
    verifiedSaving: false,
    caveat: "Kun en sammenligning af oplyste priser for samme vare, enhed, valuta og mængde. Kontroller kvalitet, momsgrundlag, rabatter, levering, aftalevilkår og faktisk indkøb før en besparelse kan dokumenteres."
  };
}
