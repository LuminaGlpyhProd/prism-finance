"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/currency";
import { useFinanceStore } from "@/store/finance-store";
import { exportExpensesCSV, downloadFile } from "@/lib/export";
import { SpendingHeatmap } from "@/components/charts/SpendingChart";

const DEFAULT_CATEGORIES = [
  "Grocery",
  "Food",
  "Work Stuff",
  "Hanging Out with Friends",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
];

export function ExpensesView() {
  const accounts = useFinanceStore((s) => s.accounts);
  const addExpense = useFinanceStore((s) => s.addExpense);
  const removeExpense = useFinanceStore((s) => s.removeExpense);
  const getFilteredExpenses = useFinanceStore((s) => s.getFilteredExpenses);
  const searchQuery = useFinanceStore((s) => s.searchQuery);
  const setSearchQuery = useFinanceStore((s) => s.setSearchQuery);
  const categoryFilter = useFinanceStore((s) => s.categoryFilter);
  const setCategoryFilter = useFinanceStore((s) => s.setCategoryFilter);
  const suggestForInput = useFinanceStore((s) => s.suggestForInput);
  const expenses = useFinanceStore((s) => s.expenses);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [tags, setTags] = useState("");

  const filtered = getFilteredExpenses();
  const suggestions = useMemo(
    () => suggestForInput(category + " " + notes),
    [category, notes, suggestForInput]
  );

  const categories = useMemo(() => {
    const fromExpenses = [...new Set(expenses.map((e) => e.category))];
    return [...new Set([...DEFAULT_CATEGORIES, ...fromExpenses])];
  }, [expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || !category.trim() || !accountId) return;
    const ok = addExpense({
      amount: amt,
      category: category.trim(),
      notes: notes.trim() || undefined,
      date: new Date().toISOString(),
      accountId,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (ok) {
      setAmount("");
      setCategory("");
      setNotes("");
      setTags("");
      setShowForm(false);
    }
  };

  const exportCsv = () => {
    const csv = exportExpensesCSV(expenses, accounts);
    downloadFile(csv, `prism-expenses-${Date.now()}.csv`, "text/csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={exportCsv}>
            <Download size={14} className="mr-1 inline" />
            CSV
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="inline mr-1" />
            Add expense
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            className="w-full glass rounded-xl pl-10 pr-3 py-2.5 text-sm bg-white/5"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="glass rounded-xl px-3 py-2 text-sm bg-white/5 max-w-[140px]"
          value={categoryFilter ?? ""}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
          >
            <GlassCard variant="strong" className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  required
                  className="glass rounded-xl px-3 py-2 bg-white/5"
                  placeholder="Amount (₱)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  required
                  list="categories"
                  className="glass rounded-xl px-3 py-2 bg-white/5"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    const s = suggestForInput(e.target.value);
                    if (s.amount && !amount) setAmount(String(s.amount));
                  }}
                />
                <datalist id="categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <select
                  className="glass rounded-xl px-3 py-2 bg-white/5"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <input
                  className="glass rounded-xl px-3 py-2 bg-white/5 sm:col-span-2"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <input
                  className="glass rounded-xl px-3 py-2 bg-white/5 sm:col-span-2"
                  placeholder="Tags (comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {suggestions.hints.length > 0 && (
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-200/90 space-y-1">
                  <p className="font-medium text-cyan-300/80">Smart suggestions</p>
                  {suggestions.hints.map((h, i) => (
                    <p key={i}>{h}</p>
                  ))}
                  {suggestions.category && (
                    <button
                      type="button"
                      className="text-cyan-300 underline"
                      onClick={() => setCategory(suggestions.category!)}
                    >
                      Use suggested category: {suggestions.category}
                    </button>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full">
                Record expense
              </Button>
            </GlassCard>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 ? (
            <GlassCard className="text-center text-white/40 py-8">
              No expenses found
            </GlassCard>
          ) : (
            filtered.map((e) => {
              const acc = accounts.find((a) => a.id === e.accountId);
              return (
                <GlassCard key={e.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{e.category}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(e.date).toLocaleString("en-PH")} · {acc?.name}
                    </p>
                    {e.notes && (
                      <p className="text-xs text-white/50 mt-1">{e.notes}</p>
                    )}
                    {e.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {e.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-red-300 font-mono">-{formatMoney(e.amount)}</p>
                    <button
                      onClick={() => removeExpense(e.id)}
                      className="text-xs text-white/30 hover:text-red-400 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
        <SpendingHeatmap expenses={expenses} />
      </div>
    </div>
  );
}
