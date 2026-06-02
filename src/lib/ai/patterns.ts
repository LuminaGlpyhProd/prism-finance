import type { Expense, SpendingPattern } from "@/types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 2);
}

export function learnPatterns(expenses: Expense[]): SpendingPattern[] {
  const map = new Map<
    string,
    { amounts: number[]; dates: string[]; keywords: Set<string> }
  >();

  for (const e of expenses) {
    const key = e.category.toLowerCase();
    const entry = map.get(key) ?? {
      amounts: [],
      dates: [],
      keywords: new Set<string>(),
    };
    entry.amounts.push(e.amount);
    entry.dates.push(e.date);
    tokenize(`${e.category} ${e.notes ?? ""} ${e.tags.join(" ")}`).forEach(
      (k) => entry.keywords.add(k)
    );
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      averageAmount:
        data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length,
      frequency: data.amounts.length,
      lastSeen: data.dates.sort().reverse()[0] ?? "",
      keywords: Array.from(data.keywords).slice(0, 12),
    }))
    .filter((p) => p.frequency >= 2)
    .sort((a, b) => b.frequency - a.frequency);
}

export function suggestCategory(
  input: string,
  patterns: SpendingPattern[],
  expenses: Expense[]
): string | null {
  const tokens = tokenize(input);
  if (!tokens.length) return null;

  let best: { category: string; score: number } | null = null;

  for (const p of patterns) {
    let score = 0;
    for (const t of tokens) {
      if (p.category.includes(t)) score += 3;
      if (p.keywords.some((k) => k.includes(t) || t.includes(k))) score += 2;
    }
    if (!best || score > best.score) best = { category: p.category, score };
  }

  if (best && best.score >= 2) return best.category;

  for (const e of expenses.slice(0, 50)) {
    const hay = `${e.category} ${e.notes ?? ""}`.toLowerCase();
    if (tokens.some((t) => hay.includes(t))) return e.category;
  }

  return null;
}

export function suggestAmount(
  category: string,
  patterns: SpendingPattern[]
): number | null {
  const match = patterns.find(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
  if (!match) return null;
  return Math.round(match.averageAmount);
}

export function getAutofillSuggestions(
  input: string,
  patterns: SpendingPattern[]
): string[] {
  const suggestions: string[] = [];
  const lower = input.toLowerCase();

  for (const p of patterns) {
    if (p.category.toLowerCase().includes(lower) && lower.length > 0) {
      suggestions.push(
        `You usually spend ₱${Math.round(p.averageAmount).toLocaleString()} on ${p.category}.`
      );
    }
  }

  const amountMatch = patterns.find((p) =>
    p.keywords.some((k) => lower.includes(k))
  );
  if (amountMatch && !suggestions.length) {
    suggestions.push(
      `This looks similar to your ${amountMatch.category} expenses (avg ₱${Math.round(amountMatch.averageAmount).toLocaleString()}).`
    );
  }

  return suggestions.slice(0, 3);
}

export function detectRecurring(expenses: Expense[]): Expense[] {
  const groups = new Map<string, Expense[]>();

  for (const e of expenses) {
    const key = `${e.category}-${Math.round(e.amount / 100) * 100}`;
    const list = groups.get(key) ?? [];
    list.push(e);
    groups.set(key, list);
  }

  return Array.from(groups.values())
    .filter((list) => list.length >= 3)
    .map((list) => list[0]);
}
