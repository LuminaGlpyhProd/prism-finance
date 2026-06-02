export type ThemeMode = "dark" | "light";

export type BudgetMode = "strict" | "balanced" | "flexible" | "custom";

export interface Account {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  notes?: string;
  date: string;
  accountId: string;
  tags: string[];
  recurring?: boolean;
  recurringInterval?: "weekly" | "monthly" | "yearly";
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: string;
  color: string;
  protected: boolean;
  createdAt: string;
  milestones: number[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number;
  limit: number;
  spent: number;
  color: string;
}

export interface BudgetPlan {
  mode: BudgetMode;
  totalIncome: number;
  categories: BudgetCategory[];
  updatedAt: string;
}

export interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: number;
  lastSeen: string;
  keywords: string[];
}

export interface AIInsight {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

export type SyncRole = "host" | "join";

export interface AppSettings {
  theme: ThemeMode;
  currency: string;
  pin?: string;
  notifications: boolean;
  /** Same Wi‑Fi LAN sync (password required) */
  syncEnabled: boolean;
  syncRole: SyncRole;
  /** PC IP shown in host settings, e.g. 192.168.1.5 */
  syncHostIp: string;
  /** SHA-256 hex of sync password — devices must match */
  syncAuthToken: string;
  /** Auto-connect/sync when app opens (same Wi‑Fi) */
  syncAutoConnect: boolean;
  lastKnownHostIp: string;
  startAtLogin: boolean;
  startAtBoot: boolean;
  autoUpdate: boolean;
}

export type ViewId =
  | "dashboard"
  | "accounts"
  | "expenses"
  | "budget"
  | "savings"
  | "assistant"
  | "settings";
