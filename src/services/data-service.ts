
import { 
  Transaction, 
  Budget, 
  ExpenseCategory, 
  Subscription, 
  Debt, 
  BillSplit,
  Notification,
  FinancialSummary 
} from "@/types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateBudgetPercentage = (used: number, total: number): number => {
  return Math.min(Math.round((used / total) * 100), 100);
};

export const getCategoryColor = (categoryName: string): string => {
  return "#9CA3AF"; // Default color if not found
};

export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Empty financial summary for initial state
export const financialSummary: FinancialSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  totalSavings: 0,
  totalInvestments: 0,
  netWorth: 0,
  budgetStatus: {
    total: 0,
    used: 0,
    remaining: 0
  },
  expenseBreakdown: [],
  trendData: []
};

// Empty notifications array
export const notifications: Notification[] = [];
