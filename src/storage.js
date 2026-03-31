const TX_KEY = '@transactions';
const BUDGET_KEY = '@budgets';

export function getTransactions() {
  const data = localStorage.getItem(TX_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransaction(tx) {
  const current = getTransactions();
  const updated = [
    { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ...current
  ];
  localStorage.setItem(TX_KEY, JSON.stringify(updated));
  return updated;
}

export function getTransactionsForMonth(year, month) {
  const all = getTransactions();
  const mStr = String(month).padStart(2, '0');
  const prefix = `${year}-${mStr}-`;
  return all.filter((t) => t.date && t.date.startsWith(prefix));
}

export function getBudgets() {
  const data = localStorage.getItem(BUDGET_KEY);
  if (!data) {
    import('./constants').then((c) => {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(c.DEFAULT_BUDGETS));
    });
    return {}; 
  }
  return JSON.parse(data);
}

export function saveBudgets(newBudgets) {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(newBudgets));
}

// date & formatting utils nested for brevity
export function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
export function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
}
export function formatPercentage(val) {
  return `${Math.round(val || 0)}%`;
}
export function getTotalSpent(spentByCategory) {
  return Object.values(spentByCategory).reduce((a, b) => a + b, 0);
}
export function getTotalBudget(budgets) {
  return Object.values(budgets).reduce((a, b) => a + (Number(b) || 0), 0);
}
export function getSpendingPercentage(spent, budget) {
  if (!budget) return 0;
  return Math.min((spent / budget) * 100, 100);
}
