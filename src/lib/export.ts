import type { Account, Expense } from "@/types";

export function exportExpensesCSV(expenses: Expense[], accounts: Account[]): string {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const headers = ["Date", "Category", "Amount", "Account", "Notes", "Tags"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toString(),
    accountMap.get(e.accountId) ?? e.accountId,
    e.notes ?? "",
    e.tags.join("; "),
  ]);
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
