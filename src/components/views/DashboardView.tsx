"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, PiggyBank, Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpendingAreaChart, CategoryPieChart } from "@/components/charts/SpendingChart";
import { formatMoney } from "@/lib/currency";
import { useFinanceStore } from "@/store/finance-store";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const accounts = useFinanceStore((s) => s.accounts);
  const expenses = useFinanceStore((s) => s.expenses);
  const goals = useFinanceStore((s) => s.goals);
  const budget = useFinanceStore((s) => s.budget);
  const getTotalBalance = useFinanceStore((s) => s.getTotalBalance);
  const getTotalExpenses = useFinanceStore((s) => s.getTotalExpenses);
  const getTotalSavings = useFinanceStore((s) => s.getTotalSavings);
  const getInsights = useFinanceStore((s) => s.getInsights);
  const getHealthScore = useFinanceStore((s) => s.getHealthScore);

  const total = getTotalBalance();
  const totalExpenses = getTotalExpenses();
  const totalSavings = getTotalSavings();
  const insights = getInsights();
  const healthScore = getHealthScore();
  const recent = expenses.slice(0, 5);

  const budgetUsed = budget
    ? budget.categories.reduce((s, c) => s + c.spent, 0)
    : 0;
  const budgetTotal = budget?.totalIncome ?? total;

  return (
    <div className="space-y-6">
      <header>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl font-bold"
        >
          Financial Overview
        </motion.h1>
        <p className="text-white/50 text-sm mt-1">
          {new Date().toLocaleDateString("en-PH", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <GlassCard variant="strong" glow className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl" />
        <p className="text-sm text-white/60">Total balance</p>
        <p className="text-4xl lg:text-5xl font-bold text-gradient mt-1">
          {formatMoney(total)}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Stat label="Expenses" value={formatMoney(totalExpenses)} icon={TrendingDown} negative />
          <Stat label="Savings" value={formatMoney(totalSavings)} icon={PiggyBank} />
          <Stat label="Accounts" value={String(accounts.length)} icon={Activity} />
          <Stat
            label="Health"
            value={`${healthScore}`}
            icon={TrendingUp}
            suffix="/100"
          />
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <SpendingAreaChart expenses={expenses} />
        <CategoryPieChart expenses={expenses} />
      </div>

      {budget && (
        <GlassCard>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Budget usage</span>
            <span>
              {formatMoney(budgetUsed)} / {formatMoney(budgetTotal)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (budgetUsed / Math.max(budgetTotal, 1)) * 100)}%`,
              }}
              className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
            />
          </div>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="text-sm font-medium text-white/70 mb-3">Accounts</h3>
          <div className="space-y-2">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: a.color }}
                  />
                  <span>{a.name}</span>
                </div>
                <span className="font-mono text-sm">{formatMoney(a.balance)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium text-white/70 mb-3">Savings goals</h3>
          {goals.length === 0 ? (
            <p className="text-white/40 text-sm">No goals yet — create one in Savings</p>
          ) : (
            goals.slice(0, 3).map((g) => {
              const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
              return (
                <div key={g.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{g.title}</span>
                    <span className="text-white/50">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        background: g.color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </GlassCard>
      </div>

      {insights.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-white/70 mb-3">AI insights</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.map((ins) => (
              <motion.div
                key={ins.id}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "glass rounded-xl p-4 border-l-2",
                  ins.type === "warning" && "border-amber-400",
                  ins.type === "success" && "border-emerald-400",
                  ins.type === "tip" && "border-violet-400",
                  ins.type === "info" && "border-cyan-400"
                )}
              >
                <p className="font-medium text-sm">{ins.title}</p>
                <p className="text-white/60 text-xs mt-1">{ins.message}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <GlassCard>
        <h3 className="text-sm font-medium text-white/70 mb-3">Recent expenses</h3>
        {recent.length === 0 ? (
          <p className="text-white/40 text-sm">No expenses logged yet</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((e) => (
              <li
                key={e.id}
                className="flex justify-between text-sm py-2 border-b border-white/5"
              >
                <span>{e.category}</span>
                <span className="text-red-300/90">-{formatMoney(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  negative,
  suffix,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  negative?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
        <Icon size={12} />
        {label}
      </div>
      <p className={cn("font-semibold", negative && "text-red-300/90")}>
        {value}
        {suffix && <span className="text-white/40 text-xs">{suffix}</span>}
      </p>
    </div>
  );
}
