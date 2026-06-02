"use client";

import { useState } from "react";
import { Moon, Sun, Bell, Shield, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useFinanceStore } from "@/store/finance-store";
import { exportExpensesCSV, downloadFile } from "@/lib/export";
import { SyncSettings } from "./SyncSettings";

export function SettingsView() {
  const settings = useFinanceStore((s) => s.settings);
  const toggleTheme = useFinanceStore((s) => s.toggleTheme);
  const setPin = useFinanceStore((s) => s.setPin);
  const achievements = useFinanceStore((s) => s.achievements);
  const expenses = useFinanceStore((s) => s.expenses);
  const accounts = useFinanceStore((s) => s.accounts);

  const [pinInput, setPinInput] = useState("");

  const exportData = () => {
    const csv = exportExpensesCSV(expenses, accounts);
    downloadFile(csv, `prism-export-${Date.now()}.csv`, "text/csv");
  };

  const loadDemoData = useFinanceStore((s) => s.loadDemoData);

  const clearData = () => {
    if (
      confirm(
        "Clear all local data? This cannot be undone. (Demo accounts will reset on reload if you clear storage.)"
      )
    ) {
      localStorage.removeItem("prism-finance-storage");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Settings</h1>

      <GlassCard>
        <h3 className="text-sm text-white/60 mb-4">Appearance</h3>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full py-2"
        >
          <span className="flex items-center gap-2">
            {settings.theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            Theme
          </span>
          <span className="text-white/50 capitalize">{settings.theme} mode</span>
        </button>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm text-white/60 mb-4 flex items-center gap-2">
          <Shield size={16} />
          Security
        </h3>
        <p className="text-xs text-white/40 mb-2">
          Optional PIN for confirming protected savings spends (coming soon)
        </p>
        <input
          type="password"
          maxLength={6}
          className="w-full glass rounded-xl px-3 py-2 bg-white/5 mb-2"
          placeholder="Set 4–6 digit PIN"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
        />
        <Button size="sm" variant="ghost" onClick={() => setPin(pinInput)}>
          Save PIN
        </Button>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm text-white/60 mb-4 flex items-center gap-2">
          <Bell size={16} />
          Wi‑Fi sync (real time)
        </h3>
        <SyncSettings />
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm text-white/60 mb-4">Data & export</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={loadDemoData}>
            Load demo data
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={clearData}>
            Clear data
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm text-white/60 mb-4 flex items-center gap-2">
          <Award size={16} />
          Achievements
        </h3>
        <div className="space-y-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-2 rounded-xl ${
                a.unlockedAt ? "glass-strong" : "opacity-40"
              }`}
            >
              <span className="text-xl">{a.icon}</span>
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-white/40">{a.description}</p>
              </div>
              {a.unlockedAt && (
                <span className="ml-auto text-[10px] text-emerald-400">Unlocked</span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <p className="text-xs text-white/30 text-center">
        Prism Finance v0.1 · PHP · Local-first AI insights
      </p>
    </div>
  );
}
