"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatMoney } from "@/lib/currency";
import { useFinanceStore } from "@/store/finance-store";

const COLORS = ["#6ee7ff", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];

export function AccountsView() {
  const accounts = useFinanceStore((s) => s.accounts);
  const addAccount = useFinanceStore((s) => s.addAccount);
  const updateAccount = useFinanceStore((s) => s.updateAccount);
  const removeAccount = useFinanceStore((s) => s.removeAccount);
  const getTotalBalance = useFinanceStore((s) => s.getTotalBalance);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addAccount({
      name: name.trim(),
      balance: parseFloat(balance) || 0,
      icon: "wallet",
      color: COLORS[accounts.length % COLORS.length],
    });
    setName("");
    setBalance("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-white/50 text-sm">
            Total: {formatMoney(getTotalBalance())}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} className="inline mr-1" />
          Add account
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a, i) => (
          <GlassCard key={a.id} glow={i === 0} className="relative group">
            <div
              className="absolute top-0 left-0 w-full h-1 rounded-t-2xl opacity-80"
              style={{ background: a.color }}
            />
            <p className="text-white/50 text-xs mt-2">{a.name}</p>
            <p className="text-2xl font-bold mt-1">{formatMoney(a.balance)}</p>
            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="number"
                className="flex-1 glass rounded-lg px-2 py-1 text-sm bg-white/5"
                placeholder="Adjust balance"
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) updateAccount(a.id, { balance: v });
                }}
              />
              <button
                onClick={() => removeAccount(a.id)}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                aria-label="Remove account"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New account"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            className="w-full glass rounded-xl px-3 py-2 bg-white/5"
            placeholder="Account name (e.g. PayPal)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            className="w-full glass rounded-xl px-3 py-2 bg-white/5"
            placeholder="Starting balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
