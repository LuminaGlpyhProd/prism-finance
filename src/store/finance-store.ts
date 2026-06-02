"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildBudgetCategories } from "@/lib/budget-presets";
import {
  detectRecurring,
  getAutofillSuggestions,
  learnPatterns,
  suggestAmount,
  suggestCategory,
} from "@/lib/ai/patterns";
import { generateInsights, computeHealthScore } from "@/lib/ai/insights";
import type {
  Account,
  Achievement,
  AppSettings,
  BudgetMode,
  BudgetPlan,
  ChatMessage,
  Expense,
  SavingsGoal,
  SpendingPattern,
  ViewId,
} from "@/types";

const DEMO_ACCOUNTS: Account[] = [
  {
    id: "acc-paypal",
    name: "PayPal",
    balance: 1000,
    icon: "wallet",
    color: "#6ee7ff",
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-debit",
    name: "Debit Card",
    balance: 1000,
    icon: "credit-card",
    color: "#a78bfa",
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-cash",
    name: "Cash Wallet",
    balance: 500,
    icon: "banknote",
    color: "#34d399",
    createdAt: new Date().toISOString(),
  },
];

interface FinanceState {
  accounts: Account[];
  expenses: Expense[];
  goals: SavingsGoal[];
  budget: BudgetPlan | null;
  settings: AppSettings;
  chatMessages: ChatMessage[];
  achievements: Achievement[];
  activeView: ViewId;
  searchQuery: string;
  categoryFilter: string | null;
  protectedSpendModal: {
    open: boolean;
    expenseDraft: Omit<Expense, "id"> | null;
    affectedGoals: SavingsGoal[];
    newBalance: number;
  } | null;

  setActiveView: (view: ViewId) => void;
  setSearchQuery: (q: string) => void;
  setCategoryFilter: (c: string | null) => void;
  toggleTheme: () => void;
  setPin: (pin: string) => void;

  addAccount: (account: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  addExpense: (expense: Omit<Expense, "id">, force?: boolean) => boolean;
  removeExpense: (id: string) => void;
  confirmProtectedSpend: () => void;
  cancelProtectedSpend: () => void;

  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt" | "current" | "milestones">) => void;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  allocateToGoal: (id: string, amount: number) => void;
  removeGoal: (id: string) => void;

  setBudgetIncome: (income: number) => void;
  setBudgetMode: (mode: BudgetMode) => void;
  updateBudgetCategory: (id: string, data: Partial<BudgetPlan["categories"][0]>) => void;

  addChatMessage: (role: "user" | "assistant", content: string) => void;

  getTotalBalance: () => number;
  getTotalExpenses: () => number;
  getTotalSavings: () => number;
  getPatterns: () => SpendingPattern[];
  getInsights: () => ReturnType<typeof generateInsights>;
  getHealthScore: () => number;
  getRecurring: () => Expense[];
  suggestForInput: (text: string) => {
    category: string | null;
    amount: number | null;
    hints: string[];
  };
  getFilteredExpenses: () => Expense[];
  unlockAchievement: (id: string) => void;
  loadDemoData: () => void;
}

function syncBudgetSpent(expenses: Expense[], budget: BudgetPlan | null): BudgetPlan | null {
  if (!budget) return null;
  const spentMap: Record<string, number> = {};
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  for (const e of expenses) {
    if (new Date(e.date) < monthStart) continue;
    const cat = budget.categories.find(
      (c) =>
        c.name.toLowerCase() === e.category.toLowerCase() ||
        e.category.toLowerCase().includes(c.name.toLowerCase())
    );
    if (cat) {
      spentMap[cat.name] = (spentMap[cat.name] ?? 0) + e.amount;
    }
  }

  return {
    ...budget,
    categories: budget.categories.map((c) => ({
      ...c,
      spent: spentMap[c.name] ?? 0,
    })),
  };
}

function checkProtectedSpend(
  accounts: Account[],
  goals: SavingsGoal[],
  amount: number,
  accountId: string
): { blocked: boolean; affectedGoals: SavingsGoal[]; newBalance: number } {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return { blocked: false, affectedGoals: [], newBalance: 0 };

  const newBalance = account.balance - amount;
  const protectedGoals = goals.filter((g) => g.protected && g.current > 0);
  const totalProtected = protectedGoals.reduce((s, g) => s + g.current, 0);
  const totalAfter = accounts.reduce((s, a) => s + a.balance, 0) - amount;

  if (totalAfter < totalProtected && protectedGoals.length > 0) {
    return { blocked: true, affectedGoals: protectedGoals, newBalance };
  }

  return { blocked: false, affectedGoals: [], newBalance };
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: DEMO_ACCOUNTS,
      expenses: [],
      goals: [],
      budget: null,
      settings: {
        theme: "dark",
        currency: "PHP",
        notifications: true,
      },
      chatMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Welcome to Prism Finance! I'm your AI co-pilot — ask about balances, spending, or savings anytime.",
          timestamp: new Date().toISOString(),
        },
      ],
      achievements: [
        {
          id: "first-expense",
          title: "First Step",
          description: "Log your first expense",
          icon: "🎯",
        },
        {
          id: "saver",
          title: "Saver",
          description: "Create a savings goal",
          icon: "💎",
        },
        {
          id: "budget-master",
          title: "Budget Master",
          description: "Set up your budget plan",
          icon: "📊",
        },
      ],
      activeView: "dashboard",
      searchQuery: "",
      categoryFilter: null,
      protectedSpendModal: null,

      setActiveView: (view) => set({ activeView: view }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setCategoryFilter: (c) => set({ categoryFilter: c }),
      toggleTheme: () =>
        set((s) => ({
          settings: {
            ...s.settings,
            theme: s.settings.theme === "dark" ? "light" : "dark",
          },
        })),
      setPin: (pin) =>
        set((s) => ({ settings: { ...s.settings, pin } })),

      addAccount: (account) =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            {
              ...account,
              id: `acc-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateAccount: (id, data) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      removeAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
        })),

      addExpense: (expense, force = false) => {
        const state = get();
        const check = checkProtectedSpend(
          state.accounts,
          state.goals,
          expense.amount,
          expense.accountId
        );

        if (check.blocked && !force) {
          set({
            protectedSpendModal: {
              open: true,
              expenseDraft: expense,
              affectedGoals: check.affectedGoals,
              newBalance: check.newBalance,
            },
          });
          return false;
        }

        const id = `exp-${Date.now()}`;
        const newExpenses = [{ ...expense, id }, ...state.expenses];
        let accounts = state.accounts.map((a) =>
          a.id === expense.accountId
            ? { ...a, balance: Math.max(0, a.balance - expense.amount) }
            : a
        );

        let budget = syncBudgetSpent(newExpenses, state.budget);

        set({
          expenses: newExpenses,
          accounts,
          budget,
          protectedSpendModal: null,
        });

        get().unlockAchievement("first-expense");
        return true;
      },

      confirmProtectedSpend: () => {
        const modal = get().protectedSpendModal;
        if (modal?.expenseDraft) {
          get().addExpense(modal.expenseDraft, true);
        }
      },

      cancelProtectedSpend: () => set({ protectedSpendModal: null }),

      removeExpense: (id) =>
        set((s) => {
          const exp = s.expenses.find((e) => e.id === id);
          if (!exp) return s;
          const accounts = s.accounts.map((a) =>
            a.id === exp.accountId ? { ...a, balance: a.balance + exp.amount } : a
          );
          const expenses = s.expenses.filter((e) => e.id !== id);
          return {
            expenses,
            accounts,
            budget: syncBudgetSpent(expenses, s.budget),
          };
        }),

      addGoal: (goal) =>
        set((s) => {
          get().unlockAchievement("saver");
          return {
            goals: [
              ...s.goals,
              {
                ...goal,
                id: `goal-${Date.now()}`,
                current: 0,
                milestones: [25, 50, 75, 100],
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),

      updateGoal: (id, data) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      allocateToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, current: Math.min(g.target, g.current + amount) }
              : g
          ),
        })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      setBudgetIncome: (income) =>
        set((s) => {
          get().unlockAchievement("budget-master");
          const mode = s.budget?.mode ?? "balanced";
          return {
            budget: {
              mode,
              totalIncome: income,
              categories: buildBudgetCategories(income, mode),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setBudgetMode: (mode) =>
        set((s) => {
          const income = s.budget?.totalIncome ?? get().getTotalBalance();
          return {
            budget: {
              mode,
              totalIncome: income,
              categories: buildBudgetCategories(income, mode),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateBudgetCategory: (id, data) =>
        set((s) => {
          if (!s.budget) return s;
          return {
            budget: {
              ...s.budget,
              categories: s.budget.categories.map((c) =>
                c.id === id ? { ...c, ...data } : c
              ),
            },
          };
        }),

      addChatMessage: (role, content) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `msg-${Date.now()}`,
              role,
              content,
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      getTotalBalance: () => get().accounts.reduce((s, a) => s + a.balance, 0),
      getTotalExpenses: () => get().expenses.reduce((s, e) => s + e.amount, 0),
      getTotalSavings: () => get().goals.reduce((s, g) => s + g.current, 0),

      getPatterns: () => learnPatterns(get().expenses),
      getInsights: () =>
        generateInsights(
          get().expenses,
          get().getTotalBalance(),
          get().budget,
          get().goals
        ),
      getHealthScore: () =>
        computeHealthScore(
          get().getTotalBalance(),
          get().expenses,
          get().budget,
          get().goals
        ),
      getRecurring: () => detectRecurring(get().expenses),

      suggestForInput: (text) => {
        const patterns = get().getPatterns();
        const category =
          suggestCategory(text, patterns, get().expenses) ??
          (text.length > 2 ? text : null);
        const amount = category
          ? suggestAmount(category, patterns)
          : null;
        const hints = getAutofillSuggestions(text, patterns);
        return { category, amount, hints };
      },

      getFilteredExpenses: () => {
        const { expenses, searchQuery, categoryFilter } = get();
        return expenses.filter((e) => {
          if (categoryFilter && e.category !== categoryFilter) return false;
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            e.category.toLowerCase().includes(q) ||
            (e.notes?.toLowerCase().includes(q) ?? false) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
          );
        });
      },

      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id && !a.unlockedAt
              ? { ...a, unlockedAt: new Date().toISOString() }
              : a
          ),
        })),

      loadDemoData: () => {
        const now = new Date();
        const daysAgo = (n: number) => {
          const d = new Date(now);
          d.setDate(d.getDate() - n);
          return d.toISOString();
        };
        set({
          expenses: [
            {
              id: "demo-1",
              amount: 2000,
              category: "Grocery",
              date: daysAgo(2),
              accountId: "acc-debit",
              tags: ["weekly"],
            },
            {
              id: "demo-2",
              amount: 2000,
              category: "Work Stuff",
              date: daysAgo(5),
              accountId: "acc-paypal",
              tags: ["office"],
            },
            {
              id: "demo-3",
              amount: 1000,
              category: "Hanging Out with Friends",
              notes: "Dinner",
              date: daysAgo(1),
              accountId: "acc-cash",
              tags: ["social"],
            },
            {
              id: "demo-4",
              amount: 500,
              category: "Food",
              date: daysAgo(3),
              accountId: "acc-cash",
              tags: [],
            },
            {
              id: "demo-5",
              amount: 2000,
              category: "Grocery",
              date: daysAgo(9),
              accountId: "acc-debit",
              tags: ["weekly"],
            },
          ],
          goals: [
            {
              id: "demo-goal",
              title: "Buy a New PC",
              target: 10000,
              current: 3500,
              icon: "💻",
              color: "#6ee7ff",
              protected: true,
              createdAt: now.toISOString(),
              milestones: [25, 50, 75, 100],
            },
          ],
          accounts: DEMO_ACCOUNTS.map((a) => ({
            ...a,
            balance:
              a.id === "acc-paypal"
                ? 800
                : a.id === "acc-debit"
                  ? 1200
                  : 300,
          })),
          budget: {
            mode: "balanced",
            totalIncome: 10000,
            categories: buildBudgetCategories(10000, "balanced", {
              Essentials: 3200,
              Savings: 1000,
              Food: 2500,
              Entertainment: 800,
            }),
            updatedAt: now.toISOString(),
          },
        });
      },
    }),
    {
      name: "prism-finance-storage",
      partialize: (s) => ({
        accounts: s.accounts,
        expenses: s.expenses,
        goals: s.goals,
        budget: s.budget,
        settings: s.settings,
        chatMessages: s.chatMessages,
        achievements: s.achievements,
      }),
    }
  )
);
