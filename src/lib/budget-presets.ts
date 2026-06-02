import type { BudgetCategory, BudgetMode } from "@/types";

const COLORS = [
  "#6ee7ff",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#fb923c",
];

export const BUDGET_PRESETS: Record<
  BudgetMode,
  { name: string; percentage: number }[]
> = {
  strict: [
    { name: "Essentials", percentage: 45 },
    { name: "Savings", percentage: 35 },
    { name: "Food", percentage: 12 },
    { name: "Entertainment", percentage: 4 },
    { name: "Emergency", percentage: 4 },
  ],
  balanced: [
    { name: "Essentials", percentage: 40 },
    { name: "Savings", percentage: 25 },
    { name: "Food", percentage: 15 },
    { name: "Entertainment", percentage: 10 },
    { name: "Emergency", percentage: 10 },
  ],
  flexible: [
    { name: "Essentials", percentage: 35 },
    { name: "Savings", percentage: 15 },
    { name: "Food", percentage: 20 },
    { name: "Entertainment", percentage: 20 },
    { name: "Emergency", percentage: 10 },
  ],
  custom: [
    { name: "Essentials", percentage: 40 },
    { name: "Savings", percentage: 25 },
    { name: "Food", percentage: 15 },
    { name: "Entertainment", percentage: 10 },
    { name: "Emergency", percentage: 10 },
  ],
};

export function buildBudgetCategories(
  totalIncome: number,
  mode: BudgetMode,
  existingSpent?: Record<string, number>
): BudgetCategory[] {
  const preset = BUDGET_PRESETS[mode];
  return preset.map((p, i) => {
    const limit = Math.round((totalIncome * p.percentage) / 100);
    return {
      id: `cat-${p.name.toLowerCase().replace(/\s/g, "-")}`,
      name: p.name,
      percentage: p.percentage,
      limit,
      spent: existingSpent?.[p.name] ?? 0,
      color: COLORS[i % COLORS.length],
    };
  });
}
