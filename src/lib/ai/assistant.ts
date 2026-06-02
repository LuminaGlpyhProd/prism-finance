import type { Account, BudgetPlan, Expense, SavingsGoal } from "@/types";
import { formatMoney } from "@/lib/currency";
import { computeHealthScore, generateInsights } from "./insights";
import { learnPatterns, suggestAmount } from "./patterns";

export function replyToUser(
  message: string,
  context: {
    accounts: Account[];
    expenses: Expense[];
    goals: SavingsGoal[];
    budget: BudgetPlan | null;
  }
): string {
  const lower = message.toLowerCase();
  const totalBalance = context.accounts.reduce((s, a) => s + a.balance, 0);
  const patterns = learnPatterns(context.expenses);
  const insights = generateInsights(
    context.expenses,
    totalBalance,
    context.budget,
    context.goals
  );

  if (
    lower.includes("balance") ||
    lower.includes("how much") ||
    lower.includes("total")
  ) {
    const breakdown = context.accounts
      .map((a) => `• ${a.name}: ${formatMoney(a.balance)}`)
      .join("\n");
    return `Your total balance is **${formatMoney(totalBalance)}** across ${context.accounts.length} account(s):\n\n${breakdown}`;
  }

  if (lower.includes("spend") || lower.includes("spending")) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTotal = context.expenses
      .filter((e) => new Date(e.date) >= monthStart)
      .reduce((s, e) => s + e.amount, 0);
    const top = getTopCategories(context.expenses, 3);
    return `This month you've spent **${formatMoney(monthTotal)}**. Top categories:\n${top.map((t) => `• ${t.name}: ${formatMoney(t.total)}`).join("\n")}`;
  }

  if (lower.includes("save") || lower.includes("savings")) {
    if (!context.goals.length) {
      return "You don't have savings goals yet. Head to **Savings** to create one — I'll help track your progress!";
    }
    return context.goals
      .map((g) => {
        const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
        return `• **${g.title}**: ${formatMoney(g.current)} / ${formatMoney(g.target)} (${pct}%)`;
      })
      .join("\n");
  }

  if (lower.includes("budget")) {
    if (!context.budget) {
      return "Set up your budget in the **Budget** tab. I can suggest a balanced split based on your income!";
    }
    return context.budget.categories
      .map((c) => {
        const left = c.limit - c.spent;
        return `• ${c.name}: ${formatMoney(c.spent)} / ${formatMoney(c.limit)} (${left >= 0 ? formatMoney(left) + " left" : "over limit"})`;
      })
      .join("\n");
  }

  if (lower.includes("health") || lower.includes("score")) {
    const score = computeHealthScore(
      totalBalance,
      context.expenses,
      context.budget,
      context.goals
    );
    return `Your financial health score is **${score}/100**. ${score >= 75 ? "You're doing great — keep it up!" : score >= 50 ? "Room to improve — check my insights on the dashboard." : "Let's work on spending and savings together — no judgment, just progress."}`;
  }

  if (lower.includes("suggest") || lower.includes("tip") || lower.includes("advice")) {
    if (!insights.length) {
      return "Things look steady! Log a few more expenses and I'll personalize tips for you.";
    }
    return insights.map((i) => `💡 **${i.title}**: ${i.message}`).join("\n\n");
  }

  if (lower.includes("grocery") || lower.includes("groceries")) {
    const amt = suggestAmount("Grocery", patterns) ?? suggestAmount("groceries", patterns);
    if (amt) {
      return `Based on your history, you usually spend around **${formatMoney(amt)}** on groceries. Want me to add that as a quick expense template?`;
    }
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hey! I'm Prism, your financial co-pilot. Ask about balances, spending, savings goals, budget, or say **give me advice** for personalized tips.";
  }

  return "I can help with balances, monthly spending, savings goals, budget status, and personalized advice. Try: *What's my total balance?* or *Give me savings tips*";
}

function getTopCategories(
  expenses: Expense[],
  limit: number
): { name: string; total: number }[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
