
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  settings?: UserSettings;
};

export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  emailNotifications: boolean;
  budgetReminders: boolean;
};

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense' | 'investment' | 'saving';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  type: 'credit-card' | 'loan' | 'emi' | 'other';
  category?: string;
  isActive?: boolean;
}

export interface BillSplit {
  id: string;
  title: string;
  totalAmount: number;
  date: string;
  participants: {
    id: string;
    name: string;
    amount: number;
    paid: boolean;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'budget' | 'bill' | 'subscription' | 'system';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalInvestments: number;
  netWorth: number;
  budgetStatus: {
    total: number;
    used: number;
    remaining: number;
  };
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  trendData: {
    date: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
}
