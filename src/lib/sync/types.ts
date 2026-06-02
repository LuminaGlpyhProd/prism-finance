import type {
  Account,
  Achievement,
  BudgetPlan,
  ChatMessage,
  Expense,
  SavingsGoal,
} from "@/types";

export type SyncRole = "host" | "join";
export type SyncConnectionStatus =
  | "off"
  | "waiting_wifi"
  | "connecting"
  | "connected"
  | "auth_failed"
  | "error";

export interface FinanceSyncSnapshot {
  revision: number;
  updatedAt: string;
  deviceId: string;
  accounts: Account[];
  expenses: Expense[];
  goals: SavingsGoal[];
  budget: BudgetPlan | null;
  chatMessages: ChatMessage[];
  achievements: Achievement[];
}

export type SyncMessage =
  | { type: "auth"; token: string }
  | { type: "auth_ok" }
  | { type: "auth_fail" }
  | { type: "state"; payload: FinanceSyncSnapshot }
  | { type: "ping" };
