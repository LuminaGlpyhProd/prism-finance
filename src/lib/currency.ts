const DEFAULT_CURRENCY = "PHP";

export function formatMoney(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = "en-PH"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
  return `₱${amount.toLocaleString()}`;
}

export { DEFAULT_CURRENCY };
