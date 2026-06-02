import type {
  AIInsight,
  BudgetPlan,
  Expense,
  SavingsGoal,
} from "@/types";
import { learnPatterns } from "./patterns";

export function generateInsights(
  expenses: Expense[],
  totalBalance: number,
  budget: BudgetPlan | null,
  goals: SavingsGoal[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeek = expenses.filter((e) => new Date(e.date) >= weekAgo);
  const lastWeekStart = new Date(weekAgo);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeek = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= lastWeekStart && d < weekAgo;
  });

  const foodThis = sumByCategory(thisWeek, "food");
  const foodLast = sumByCategory(lastWeek, "food");
  if (foodLast > 0 && foodThis > foodLast * 1.2) {
    const pct = Math.round(((foodThis - foodLast) / foodLast) * 100);
    insights.push({
      id: `food-${Date.now()}`,
      type: "warning",
      title: "Food spending up",
      message: `You spent ${pct}% more on food this week.`,
      createdAt: now.toISOString(),
    });
  }

  if (budget) {
    for (const cat of budget.categories) {
      const usage = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
      if (usage >= 85) {
        insights.push({
          id: `budget-${cat.id}`,
          type: "warning",
          title: `${cat.name} budget alert`,
          message: `Your ${cat.name.toLowerCase()} spending is at ${Math.round(usage)}% of your monthly limit.`,
          createdAt: now.toISOString(),
        });
      }
    }
  }

  const monthExpenses = expenses.filter((e) => new Date(e.date) >= monthStart);
  const discretionary = monthExpenses
    .filter((e) =>
      ["entertainment", "shopping", "hanging out", "games"].some((k) =>
        e.category.toLowerCase().includes(k)
      )
    )
    .reduce((s, e) => s + e.amount, 0);

  if (discretionary > 2000) {
    insights.push({
      id: "save-tip",
      type: "tip",
      title: "Savings opportunity",
      message: `You could save ₱${Math.round(discretionary * 0.3).toLocaleString()} this month by trimming non-essential expenses.`,
      createdAt: now.toISOString(),
    });
  }

  for (const goal of goals) {
    const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    if (pct >= 100) {
      insights.push({
        id: `goal-done-${goal.id}`,
        type: "success",
        title: "Goal reached!",
        message: `Congratulations! You've reached your "${goal.title}" savings goal.`,
        createdAt: now.toISOString(),
      });
    } else if (pct >= 75) {
      insights.push({
        id: `goal-track-${goal.id}`,
        type: "success",
        title: "On track",
        message: `You're on track to reach "${goal.title}" — ${Math.round(pct)}% complete.`,
        createdAt: now.toISOString(),
      });
    }
  }

  const patterns = learnPatterns(expenses);
  for (const p of patterns.slice(0, 2)) {
    if (p.frequency >= 4) {
      insights.push({
        id: `pattern-${p.category}`,
        type: "info",
        title: "Recurring habit detected",
        message: `You often spend around ₱${Math.round(p.averageAmount).toLocaleString()} on ${p.category} (${p.frequency} times).`,
        createdAt: now.toISOString(),
      });
    }
  }

  if (totalBalance > 0 && monthExpenses.length === 0) {
    insights.push({
      id: "healthy-start",
      type: "info",
      title: "Clean slate",
      message: "No expenses logged this month yet. Great time to set your budget!",
      createdAt: now.toISOString(),
    });
  }

  return insights.slice(0, 8);
}

function sumByCategory(expenses: Expense[], keyword: string): number {
  return expenses
    .filter((e) => e.category.toLowerCase().includes(keyword))
    .reduce((s, e) => s + e.amount, 0);
}

export function computeHealthScore(
  totalBalance: number,
  expenses: Expense[],
  budget: BudgetPlan | null,
  goals: SavingsGoal[]
): number {
  let score = 70;

  if (totalBalance > 5000) score += 10;
  if (totalBalance < 500) score -= 15;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTotal = expenses
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  if (monthTotal < totalBalance * 0.5) score += 10;
  if (monthTotal > totalBalance) score -= 20;

  if (budget) {
    const overBudget = budget.categories.filter(
      (c) => c.limit > 0 && c.spent > c.limit
    ).length;
    score -= overBudget * 8;
  }

  const goalsOnTrack = goals.filter(
    (g) => g.target > 0 && g.current / g.target >= 0.5
  ).length;
  score += goalsOnTrack * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function forecastGoalCompletion(goal: SavingsGoal): string | null {
  if (goal.current >= goal.target) return "Completed";
  const remaining = goal.target - goal.current;
  const monthsEstimate = Math.ceil(remaining / Math.max(goal.current * 0.1, 500));
  const date = new Date();
  date.setMonth(date.getMonth() + monthsEstimate);
  return date.toLocaleDateString("en-PH", { month: "short", year: "numeric" });
}
