"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Lock, LockOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatMoney } from "@/lib/currency";
import { forecastGoalCompletion } from "@/lib/ai/insights";
import { useFinanceStore } from "@/store/finance-store";

const GOAL_ICONS = ["💻", "🏠", "✈️", "🎮", "📱", "🎓", "🚗", "💎"];

export function SavingsView() {
  const goals = useFinanceStore((s) => s.goals);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const updateGoal = useFinanceStore((s) => s.updateGoal);
  const allocateToGoal = useFinanceStore((s) => s.allocateToGoal);
  const removeGoal = useFinanceStore((s) => s.removeGoal);
  const getTotalSavings = useFinanceStore((s) => s.getTotalSavings);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [icon, setIcon] = useState("💻");
  const [protectedGoal, setProtectedGoal] = useState(true);
  const [allocateId, setAllocateId] = useState<string | null>(null);
  const [allocateAmt, setAllocateAmt] = useState("");

  const handleCreate = () => {
    if (!title.trim() || !target) return;
    addGoal({
      title: title.trim(),
      target: parseFloat(target),
      icon,
      color: "#6ee7ff",
      protected: protectedGoal,
    });
    setTitle("");
    setTarget("");
    setOpen(false);
  };

  const handleAllocate = () => {
    if (!allocateId) return;
    const amt = parseFloat(allocateAmt);
    if (amt > 0) {
      allocateToGoal(allocateId, amt);
      setAllocateId(null);
      setAllocateAmt("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings goals</h1>
          <p className="text-white/50 text-sm">
            Total saved: {formatMoney(getTotalSavings())}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} className="inline mr-1" />
          New goal
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
          const remaining = Math.max(0, g.target - g.current);
          const forecast = forecastGoalCompletion(g);
          const milestoneHit = g.milestones.find(
            (m) => pct >= m && pct < m + 5
          );

          return (
            <GlassCard key={g.id} variant="strong" glow={pct >= 100}>
              <div className="flex justify-between items-start">
                <span className="text-3xl">{g.icon}</span>
                <button
                  onClick={() => updateGoal(g.id, { protected: !g.protected })}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                  title={g.protected ? "Protected" : "Unprotected"}
                >
                  {g.protected ? (
                    <Lock size={16} className="text-amber-300" />
                  ) : (
                    <LockOpen size={16} className="text-white/40" />
                  )}
                </button>
              </div>
              <h3 className="font-semibold mt-2">{g.title}</h3>
              <p className="text-2xl font-bold mt-1">
                {formatMoney(g.current)}{" "}
                <span className="text-white/40 text-base font-normal">
                  / {formatMoney(g.target)}
                </span>
              </p>

              <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                />
                {milestoneHit && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    className="absolute inset-0 bg-white/20 rounded-full"
                  />
                )}
              </div>

              <div className="flex justify-between mt-2 text-xs text-white/50">
                <span>{Math.round(pct)}% complete</span>
                <span>{formatMoney(remaining)} to go</span>
              </div>

              {forecast && pct < 100 && (
                <p className="text-xs text-cyan-300/70 mt-2">
                  Est. completion: {forecast}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setAllocateId(g.id)}
                >
                  Add funds
                </Button>
                <button
                  onClick={() => removeGoal(g.id)}
                  className="text-xs text-white/30 hover:text-red-400 px-2"
                >
                  Delete
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {goals.length === 0 && (
        <GlassCard className="text-center py-12 text-white/40">
          <p>Create your first savings goal — e.g. &quot;Buy a New PC&quot; for ₱10,000</p>
        </GlassCard>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New savings goal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create goal</Button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            className="w-full glass rounded-xl px-3 py-2 bg-white/5"
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            className="w-full glass rounded-xl px-3 py-2 bg-white/5"
            placeholder="Target amount (₱)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {GOAL_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`text-xl p-2 rounded-lg ${
                  icon === i ? "glass-strong" : "opacity-50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={protectedGoal}
              onChange={(e) => setProtectedGoal(e.target.checked)}
            />
            Protect savings (warn before spending below saved amount)
          </label>
        </div>
      </Modal>

      <Modal
        open={!!allocateId}
        onClose={() => setAllocateId(null)}
        title="Allocate to goal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAllocateId(null)}>
              Cancel
            </Button>
            <Button onClick={handleAllocate}>Add</Button>
          </>
        }
      >
        <input
          type="number"
          className="w-full glass rounded-xl px-3 py-2 bg-white/5"
          placeholder="Amount (₱)"
          value={allocateAmt}
          onChange={(e) => setAllocateAmt(e.target.value)}
        />
      </Modal>
    </div>
  );
}
