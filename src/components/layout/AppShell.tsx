"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, MobileNav } from "./Sidebar";
import { ProtectedSpendModal } from "@/components/ui/Modal";
import { useFinanceStore } from "@/store/finance-store";
import { DashboardView } from "@/components/views/DashboardView";
import { AccountsView } from "@/components/views/AccountsView";
import { ExpensesView } from "@/components/views/ExpensesView";
import { BudgetView } from "@/components/views/BudgetView";
import { SavingsView } from "@/components/views/SavingsView";
import { AssistantView } from "@/components/views/AssistantView";
import { SettingsView } from "@/components/views/SettingsView";
import { cn } from "@/lib/utils";

const VIEWS = {
  dashboard: DashboardView,
  accounts: AccountsView,
  expenses: ExpensesView,
  budget: BudgetView,
  savings: SavingsView,
  assistant: AssistantView,
  settings: SettingsView,
};

export function AppShell() {
  const activeView = useFinanceStore((s) => s.activeView);
  const theme = useFinanceStore((s) => s.settings.theme);
  const View = VIEWS[activeView];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return (
    <div
      className={cn(
        "min-h-dvh flex",
        theme === "dark" ? "mesh-bg text-white" : "mesh-bg-light text-slate-900"
      )}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] lg:p-8 pb-[max(6rem,env(safe-area-inset-bottom))] lg:pb-8 relative z-10 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
          >
            <View />
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileNav />
      <ProtectedSpendModal />
    </div>
  );
}
