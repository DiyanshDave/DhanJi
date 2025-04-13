
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency, calculateBudgetPercentage } from "@/services/data-service";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createTransaction, getTransactions } from "@/services/supabase-service";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowUpCircle, ArrowDownCircle, Banknote, TrendingUp } from "lucide-react";
import { Transaction } from "@/types";

// Form schema
const transactionSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const FinancialOverview = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'saving' | 'investment'>('income');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Create form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 1000,
      description: "",
    },
  });

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    return transactions.reduce(
      (acc, transaction) => {
        switch (transaction.type) {
          case 'income':
            acc.income += transaction.amount;
            break;
          case 'expense':
            acc.expenses += transaction.amount;
            break;
          case 'saving':
            acc.savings += transaction.amount;
            break;
          case 'investment':
            acc.investments += transaction.amount;
            break;
        }
        return acc;
      },
      { income: 0, expenses: 0, savings: 0, investments: 0 }
    );
  };

  const totals = calculateTotals();

  // Get values from form
  const amount = form.watch("amount");

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    form.setValue("amount", value[0]);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      form.setValue("amount", value);
    }
  };

  // Open dialog with selected transaction type
  const openTransactionDialog = (type: 'income' | 'expense' | 'saving' | 'investment') => {
    setTransactionType(type);
    setDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data: TransactionFormValues) => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Create the transaction
      const result = await createTransaction({
        amount: data.amount,
        category: transactionType === 'expense' ? 'General' : transactionType,
        description: data.description || `${transactionType} transaction`,
        date: today,
        type: transactionType
      });

      if (result) {
        toast({
          title: "Success!",
          description: `Your ${transactionType} of ${formatCurrency(data.amount)} has been added.`
        });
        
        // Close the dialog
        setDialogOpen(false);
        
        // Reset form
        form.reset({
          amount: 1000,
          description: "",
        });
        
        // Update transactions with the new one
        setTransactions([...transactions, result]);
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction. Please try again."
      });
    }
  };

  // Get color and icon based on transaction type
  const getTransactionTypeInfo = () => {
    switch (transactionType) {
      case 'income':
        return { 
          title: "Add Income", 
          description: "Add money you've received",
          color: "bg-dhanji-income text-white",
          icon: <ArrowUpCircle className="h-5 w-5" /> 
        };
      case 'expense':
        return { 
          title: "Add Expense", 
          description: "Add money you've spent",
          color: "bg-dhanji-expense text-white",
          icon: <ArrowDownCircle className="h-5 w-5" /> 
        };
      case 'saving':
        return { 
          title: "Add Saving", 
          description: "Add money you've saved",
          color: "bg-dhanji-saving text-white",
          icon: <Banknote className="h-5 w-5" /> 
        };
      case 'investment':
        return { 
          title: "Add Investment", 
          description: "Add money you've invested",
          color: "bg-dhanji-investment text-white",
          icon: <TrendingUp className="h-5 w-5" /> 
        };
    }
  };

  const typeInfo = getTransactionTypeInfo();
  
  // Show financial overview cards
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Income Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.income)}</div>
          <div className="mt-4 h-1 w-full bg-dhanji-income/20 rounded-full overflow-hidden">
            {totals.income > 0 && (
              <div className="h-full bg-dhanji-income" style={{ width: '100%' }} />
            )}
          </div>
          <Button 
            onClick={() => openTransactionDialog('income')} 
            className="mt-4 w-full bg-dhanji-income hover:bg-dhanji-income/90"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </CardContent>
      </Card>
      
      {/* Expenses Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.expenses)}</div>
          <div className="mt-4 h-1 w-full bg-dhanji-expense/20 rounded-full overflow-hidden">
            {totals.expenses > 0 && (
              <div className="h-full bg-dhanji-expense" style={{ width: '100%' }} />
            )}
          </div>
          <Button 
            onClick={() => openTransactionDialog('expense')} 
            className="mt-4 w-full bg-dhanji-expense hover:bg-dhanji-expense/90"
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </CardContent>
      </Card>
      
      {/* Savings Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.savings)}</div>
          <div className="mt-4 h-1 w-full bg-dhanji-saving/20 rounded-full overflow-hidden">
            {totals.savings > 0 && (
              <div className="h-full bg-dhanji-saving" style={{ width: '100%' }} />
            )}
          </div>
          <Button 
            onClick={() => openTransactionDialog('saving')} 
            className="mt-4 w-full bg-dhanji-saving hover:bg-dhanji-saving/90"
          >
            <Banknote className="mr-2 h-4 w-4" />
            Add Savings
          </Button>
        </CardContent>
      </Card>
      
      {/* Investments Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totals.investments)}</div>
          <div className="mt-4 h-1 w-full bg-dhanji-investment/20 rounded-full overflow-hidden">
            {totals.investments > 0 && (
              <div className="h-full bg-dhanji-investment" style={{ width: '100%' }} />
            )}
          </div>
          <Button 
            onClick={() => openTransactionDialog('investment')} 
            className="mt-4 w-full bg-dhanji-investment hover:bg-dhanji-investment/90"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Add Investment
          </Button>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {typeInfo.icon}
              <span className="ml-2">{typeInfo.title}</span>
            </DialogTitle>
            <DialogDescription>
              {typeInfo.description}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={handleInputChange}
                            className="text-xl font-bold"
                          />
                        </FormControl>
                        <div className="text-xl font-bold">{formatCurrency(field.value)}</div>
                      </div>
                      <FormControl>
                        <Slider
                          defaultValue={[1000]}
                          max={100000}
                          step={100}
                          value={[field.value]}
                          onValueChange={handleSliderChange}
                          className="pt-4"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Salary, Rent, Investment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={typeInfo.color}>
                  {typeInfo.title}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to get colors for chart segments (kept for future use)
const getCategoryColor = (index: number) => {
  const colors = [
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#10B981', // Green
    '#0EA5E9', // Blue
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#F59E0B', // Amber
    '#EF4444', // Red
  ];
  
  return colors[index % colors.length];
};
