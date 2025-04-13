import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/types";
import { getBudgets, formatCurrency, calculateBudgetPercentage, deleteBudget, updateBudgetSpent } from "@/services/supabase-service";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, Trash2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const BudgetOverview = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDeleteBudget = async (id: string) => {
    const success = await deleteBudget(id);
    if (success) {
      await fetchBudgets();
    }
  };

  const handleAddExpense = async () => {
    if (!selectedBudget || expenseAmount <= 0) {
      if (expenseAmount <= 0) {
        toast({
          variant: 'destructive',
          title: 'Invalid amount',
          description: 'Please enter an amount greater than zero.'
        });
      }
      return;
    }
    
    const success = await updateBudgetSpent(selectedBudget.id, selectedBudget.spent + expenseAmount);
    if (success) {
      setExpenseAmount(0);
      setSelectedBudget(null);
      await fetchBudgets();
    }
  };

  const handleViewAll = () => {
    navigate("/budget");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <p className="text-muted-foreground">Loading budgets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
          <p className="text-muted-foreground text-center">
            You haven't created any budgets yet.
          </p>
          <Button onClick={() => navigate('/budget/create')}>
            Create First Budget
          </Button>
        </CardContent>
      </Card>
    );
  }

  const topBudgets = [...budgets]
    .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Overview</CardTitle>
        <Button variant="link" onClick={handleViewAll} className="flex items-center">
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topBudgets.map((budget) => {
            const percentage = calculateBudgetPercentage(budget.spent, budget.limit);
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setSelectedBudget(budget)}
                        >
                          <PlusCircleIcon className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Expense to {budget.category}</DialogTitle>
                          <DialogDescription>
                            Enter the amount to add to your current spent amount.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={expenseAmount || ''}
                            onChange={(e) => setExpenseAmount(Number(e.target.value))}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddExpense}>Add Expense</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this budget? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={percentage > 90 ? "h-2 bg-destructive/20" : "h-2 bg-primary/20"}
                />
                <div className="flex justify-between text-xs">
                  <span 
                    className={percentage > 90 ? "text-destructive" : "text-muted-foreground"}
                  >
                    {percentage}% used
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.limit - budget.spent)} remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
