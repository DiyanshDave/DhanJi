import { supabase } from "@/integrations/supabase/client";
import { 
  Transaction, 
  Budget, 
  ExpenseCategory, 
  Subscription, 
  User,
  Debt
} from "@/types";
import { toast as uiToast } from "@/hooks/use-toast";

// Helper function to format currency in INR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper function to calculate budget percentage
export const calculateBudgetPercentage = (used: number, total: number): number => {
  return Math.min(Math.round((used / total) * 100), 100);
};

// Function to get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to get the current user's ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
};

// TRANSACTIONS
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      amount: Number(item.amount),
      category: item.category,
      description: item.description || '',
      date: item.date,
      type: item.type as 'income' | 'expense' | 'investment' | 'saving'
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to load transactions',
      description: 'Please try again later.'
    });
    return [];
  }
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        user_id: userId // Add the user_id here
      })
      .select()
      .single();
    
    if (error) throw error;
    
    uiToast({
      title: 'Transaction Added',
      description: `${transaction.type === 'expense' ? 'Expense' : 'Transaction'} of ${formatCurrency(transaction.amount)} added successfully.`
    });
    
    return {
      id: data.id,
      amount: Number(data.amount),
      category: data.category,
      description: data.description || '',
      date: data.date,
      type: data.type as 'income' | 'expense' | 'investment' | 'saving'
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to add transaction',
      description: 'Please try again later.'
    });
    return null;
  }
};

export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    uiToast({
      title: 'Transaction Deleted',
      description: 'Transaction has been successfully deleted.'
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to delete transaction',
      description: 'Please try again later.'
    });
    return false;
  }
};

// BUDGETS
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      category: item.category,
      limit: Number(item.limit),
      spent: Number(item.spent),
      timeframe: item.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly'
    }));
  } catch (error) {
    console.error('Error fetching budgets:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to load budgets',
      description: 'Please try again later.'
    });
    return [];
  }
};

export const createBudget = async (budget: Omit<Budget, 'id'>): Promise<Budget | null> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        category: budget.category,
        limit: budget.limit,
        spent: budget.spent,
        timeframe: budget.timeframe,
        user_id: userId // Add the user_id here
      })
      .select()
      .single();
    
    if (error) throw error;
    
    uiToast({
      title: 'Budget Created',
      description: `Budget for ${budget.category} created successfully.`
    });
    
    return {
      id: data.id,
      category: data.category,
      limit: Number(data.limit),
      spent: Number(data.spent),
      timeframe: data.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly'
    };
  } catch (error) {
    console.error('Error creating budget:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to create budget',
      description: 'Please try again later.'
    });
    return null;
  }
};

export const deleteBudget = async (budgetId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    uiToast({
      title: 'Budget Deleted',
      description: 'Budget has been successfully deleted.'
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting budget:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to delete budget',
      description: 'Please try again later.'
    });
    return false;
  }
};

export const updateBudgetSpent = async (budgetId: string, newSpentAmount: number): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('budgets')
      .update({ 
        spent: newSpentAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', budgetId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    uiToast({
      title: 'Budget Updated',
      description: 'Budget expense has been updated successfully.'
    });
    
    return true;
  } catch (error) {
    console.error('Error updating budget spent:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to update budget',
      description: 'Please try again later.'
    });
    return false;
  }
};

// CATEGORIES
export const getCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
      icon: item.icon
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to load categories',
      description: 'Please try again later.'
    });
    return [];
  }
};

// SUBSCRIPTIONS
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount),
      frequency: item.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
      nextBillingDate: item.next_billing_date,
      category: item.category
    }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to load subscriptions',
      description: 'Please try again later.'
    });
    return [];
  }
};

export const createSubscription = async (subscription: Omit<Subscription, 'id'>): Promise<Subscription | null> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        name: subscription.name,
        amount: subscription.amount,
        frequency: subscription.frequency,
        next_billing_date: subscription.nextBillingDate,
        category: subscription.category,
        user_id: userId // Add the user_id here
      })
      .select()
      .single();
    
    if (error) throw error;
    
    uiToast({
      title: 'Subscription Added',
      description: `${subscription.name} subscription added successfully.`
    });
    
    return {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      frequency: data.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
      nextBillingDate: data.next_billing_date,
      category: data.category
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to add subscription',
      description: 'Please try again later.'
    });
    return null;
  }
};

export const deleteSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return false;
  }
};

// DEBTS
export const getDebts = async (): Promise<Debt[]> => {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      totalAmount: Number(item.total_amount),
      remainingAmount: Number(item.remaining_amount),
      interestRate: Number(item.interest_rate),
      minimumPayment: Number(item.minimum_payment),
      dueDate: item.due_date,
      type: item.type as 'credit-card' | 'loan' | 'emi' | 'other',
      category: item.category || 'Debt',
      isActive: item.is_active
    }));
  } catch (error) {
    console.error('Error fetching debts:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to load debts',
      description: 'Please try again later.'
    });
    return [];
  }
};

export const createDebt = async (debt: Omit<Debt, 'id'>): Promise<Debt | null> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('debts')
      .insert({
        name: debt.name,
        total_amount: debt.totalAmount,
        remaining_amount: debt.remainingAmount,
        interest_rate: debt.interestRate,
        minimum_payment: debt.minimumPayment,
        due_date: debt.dueDate,
        type: debt.type,
        category: debt.category || 'Debt',
        is_active: debt.isActive !== false,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    uiToast({
      title: 'Debt Added',
      description: `${debt.name} debt added successfully.`
    });
    
    return {
      id: data.id,
      name: data.name,
      totalAmount: Number(data.total_amount),
      remainingAmount: Number(data.remaining_amount),
      interestRate: Number(data.interest_rate),
      minimumPayment: Number(data.minimum_payment),
      dueDate: data.due_date,
      type: data.type as 'credit-card' | 'loan' | 'emi' | 'other',
      category: data.category || 'Debt',
      isActive: data.is_active
    };
  } catch (error) {
    console.error('Error creating debt:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to add debt',
      description: 'Please try again later.'
    });
    return null;
  }
};

export const deleteDebt = async (debtId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', debtId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    uiToast({
      title: 'Debt Removed',
      description: 'Debt has been successfully removed.'
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting debt:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to delete debt',
      description: 'Please try again later.'
    });
    return false;
  }
};

// USER PROFILE
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name || 'User',
      email: data.email || '',
      avatar: data.avatar || '',
      settings: {
        theme: data.theme as 'light' | 'dark' | 'system',
        currency: data.currency || 'INR',
        emailNotifications: data.email_notifications || true,
        budgetReminders: data.budget_reminders || true,
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profile: Partial<User>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        avatar: profile.avatar,
        theme: profile.settings?.theme,
        currency: profile.settings?.currency,
        email_notifications: profile.settings?.emailNotifications,
        budget_reminders: profile.settings?.budgetReminders,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    uiToast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.'
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    uiToast({
      variant: 'destructive',
      title: 'Failed to update profile',
      description: 'Please try again later.'
    });
    return false;
  }
};

// Helper function to get category color
export const getCategoryColor = async (categoryName: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('color')
      .eq('name', categoryName)
      .single();
    
    if (error || !data) return "#9CA3AF"; // Default color if not found
    
    return data.color;
  } catch (error) {
    console.error('Error fetching category color:', error);
    return "#9CA3AF"; // Default color if error
  }
};
