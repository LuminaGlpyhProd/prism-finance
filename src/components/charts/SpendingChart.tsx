"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Expense } from "@/types";

export function SpendingAreaChart({ expenses }: { expenses: Expense[] }) {
  const byDay = new Map<string, number>();
  const days = 14;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    byDay.set(key, 0);
  }
  for (const e of expenses) {
    const d = new Date(e.date);
    const key = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + e.amount);
  }
  const data = Array.from(byDay.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  return (
    <GlassCard className="h-64">
      <h3 className="text-sm font-medium text-white/70 mb-4">14-day spending</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7ff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6ee7ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(5,6,10,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
            }}
            formatter={(v: number) => [`₱${v.toLocaleString()}`, "Spent"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6ee7ff"
            fill="url(#spendGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

const PIE_COLORS = ["#6ee7ff", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#fb923c"];

export function CategoryPieChart({ expenses }: { expenses: Expense[] }) {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  const data = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (!data.length) {
    return (
      <GlassCard className="h-64 flex items-center justify-center text-white/40 text-sm">
        No spending data yet
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-64">
      <h3 className="text-sm font-medium text-white/70 mb-2">By category</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(5,6,10,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
            }}
            formatter={(v: number) => `₱${v.toLocaleString()}`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-1 justify-center">
        {data.map((d, i) => (
          <span key={d.name} className="text-[10px] text-white/50 flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            {d.name}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

export function SpendingHeatmap({ expenses }: { expenses: Expense[] }) {
  const grid: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 4 }, () => 0)
  );
  for (const e of expenses) {
    const d = new Date(e.date);
    const day = d.getDay();
    const week = Math.min(3, Math.floor((d.getDate() - 1) / 7));
    grid[day][week] += e.amount;
  }
  const max = Math.max(...grid.flat(), 1);

  return (
    <GlassCard>
      <h3 className="text-sm font-medium text-white/70 mb-3">Spending heatmap</h3>
      <div className="grid grid-cols-5 gap-1">
        <div />
        {["W1", "W2", "W3", "W4"].map((w) => (
          <div key={w} className="text-[9px] text-center text-white/30">
            {w}
          </div>
        ))}
        {["S", "M", "T", "W", "T", "F", "S"].map((day, di) => (
          <div key={day} className="contents">
            <div className="text-[9px] text-white/30 flex items-center">{day}</div>
            {grid[di].map((val, wi) => (
              <div
                key={`${di}-${wi}`}
                className="aspect-square rounded-md transition-transform hover:scale-110 min-h-[20px]"
                style={{
                  background: `rgba(110, 231, 255, ${0.1 + (val / max) * 0.7})`,
                }}
                title={`₱${val.toLocaleString()}`}
              />
            ))}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
