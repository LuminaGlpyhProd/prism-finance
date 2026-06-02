"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/store/finance-store";
import type { ViewId } from "@/types";

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "budget", label: "Budget", icon: PieChart },
  { id: "savings", label: "Savings", icon: Target },
  { id: "assistant", label: "AI Assistant", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const activeView = useFinanceStore((s) => s.activeView);
  const setActiveView = useFinanceStore((s) => s.setActiveView);

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 p-4 gap-2">
      <div className="mb-6 px-2">
        <h1 className="text-xl font-bold text-gradient">Prism</h1>
        <p className="text-xs text-white/40 mt-0.5">Finance OS</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 glass-strong rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const activeView = useFinanceStore((s) => s.activeView);
  const setActiveView = useFinanceStore((s) => s.setActiveView);
  const items = NAV.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/10 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px]",
                active ? "text-cyan-300" : "text-white/40"
              )}
            >
              <Icon size={20} />
              {item.label.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
