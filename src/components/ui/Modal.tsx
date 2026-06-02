"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFinanceStore } from "@/store/finance-store";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 glass-strong glow-ring rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-white/80 text-sm">{children}</div>
            {footer && <div className="mt-6 flex gap-3 justify-end">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ProtectedSpendModal() {
  const modal = useFinanceStore((s) => s.protectedSpendModal);
  const cancel = useFinanceStore((s) => s.cancelProtectedSpend);
  const confirm = useFinanceStore((s) => s.confirmProtectedSpend);

  if (!modal?.open) return null;

  return (
    <Modal
      open
      onClose={cancel}
      title="Break savings limit?"
      footer={
        <>
          <Button variant="ghost" onClick={cancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm}>
            Continue Anyway
          </Button>
        </>
      }
    >
      <p className="mb-4 text-amber-200/90">
        This expense would drop your balance below your protected savings threshold.
      </p>
      <div className="space-y-2 glass rounded-xl p-3">
        <p>
          New account balance:{" "}
          <strong>₱{modal.newBalance.toLocaleString()}</strong>
        </p>
        {modal.affectedGoals.map((g) => (
          <p key={g.id} className="text-white/60">
            Affects goal: <span className="text-white">{g.title}</span> (
            {Math.round((g.current / g.target) * 100)}% progress)
          </p>
        ))}
      </div>
    </Modal>
  );
}
