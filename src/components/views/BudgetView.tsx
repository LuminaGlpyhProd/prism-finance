"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/currency";
import { useFinanceStore } from "@/store/finance-store";
import type { BudgetMode } from "@/types";
import { cn } from "@/lib/utils";

const MODES: { id: BudgetMode; label: string; desc: string }[] = [
  { id: "strict", label: "Strict Saving", desc: "Maximize savings" },
  { id: "balanced", label: "Balanced", desc: "Recommended split" },
  { id: "flexible", label: "Flexible", desc: "More spending room" },
  { id: "custom", label: "Custom", desc: "Adjust sliders" },
];

export function BudgetView() {
  const budget = useFinanceStore((s) => s.budget);
  const setBudgetIncome = useFinanceStore((s) => s.setBudgetIncome);
  const setBudgetMode = useFinanceStore((s) => s.setBudgetMode);
  const updateBudgetCategory = useFinanceStore((s) => s.updateBudgetCategory);
  const getTotalBalance = useFinanceStore((s) => s.getTotalBalance);

  const [incomeInput, setIncomeInput] = useState(
    String(budget?.totalIncome ?? getTotalBalance())
  );

  const setup = () => {
    const income = parseFloat(incomeInput) || getTotalBalance();
    setBudgetIncome(income);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Budget planner</h1>
        <p className="text-white/50 text-sm">
          Split your money intelligently across categories
        </p>
      </header>

      {!budget ? (
        <GlassCard variant="strong" className="max-w-md">
          <p className="text-white/70 text-sm mb-4">
            Enter your monthly budget based on available funds. We&apos;ll suggest a
            balanced allocation.
          </p>
          <input
            type="number"
            className="w-full glass rounded-xl px-3 py-2 mb-4 bg-white/5"
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
            placeholder="Monthly budget (₱)"
          />
          <Button onClick={setup} className="w-full">
            Generate budget plan
          </Button>
        </GlassCard>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setBudgetMode(m.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm transition-all",
                  budget.mode === m.id
                    ? "glass-strong text-white"
                    : "glass text-white/50 hover:text-white/80"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <GlassCard variant="strong" glow>
            <p className="text-white/50 text-sm">Monthly budget</p>
            <p className="text-3xl font-bold text-gradient">
              {formatMoney(budget.totalIncome)}
            </p>
          </GlassCard>

          <div className="space-y-4">
            {budget.categories.map((cat) => {
              const usage =
                cat.limit > 0 ? Math.min(100, (cat.spent / cat.limit) * 100) : 0;
              const over = cat.spent > cat.limit;
              return (
                <GlassCard key={cat.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: cat.color }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm text-white/50">
                      {cat.percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>
                      Spent {formatMoney(cat.spent)} / {formatMoney(cat.limit)}
                    </span>
                    <span className={over ? "text-red-400" : "text-emerald-400/80"}>
                      {formatMoney(Math.max(0, cat.limit - cat.spent))} left
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usage}%` }}
                      className={cn(
                        "h-full rounded-full",
                        over ? "bg-red-400" : ""
                      )}
                      style={
                        !over
                          ? { background: cat.color }
                          : undefined
                      }
                    />
                  </div>
                  {budget.mode === "custom" && (
                    <input
                      type="range"
                      min={5}
                      max={60}
                      value={cat.percentage}
                      onChange={(e) => {
                        const pct = parseInt(e.target.value, 10);
                        updateBudgetCategory(cat.id, {
                          percentage: pct,
                          limit: Math.round((budget.totalIncome * pct) / 100),
                        });
                      }}
                      className="w-full accent-cyan-400"
                    />
                  )}
                </GlassCard>
              );
            })}
          </div>

          <GlassCard>
            <h3 className="text-sm text-white/60 mb-2">Example split</h3>
            <p className="text-sm text-white/80">
              For {formatMoney(budget.totalIncome)}:{" "}
              {budget.categories
                .map((c) => `${formatMoney(c.limit)} ${c.name}`)
                .join(" · ")}
            </p>
          </GlassCard>
        </>
      )}
    </div>
  );
}
