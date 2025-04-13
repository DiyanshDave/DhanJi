
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { PlusCircle, Trash2, PlusCircleIcon } from "lucide-react";
import { Budget } from "@/types";
import { getBudgets, formatCurrency, calculateBudgetPercentage, deleteBudget, updateBudgetSpent } from "@/services/supabase-service";
import { useToast } from "@/hooks/use-toast";

const BudgetList = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
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
      setBudgets(budgets.filter(budget => budget.id !== id));
    }
  };

  const handleAddExpense = async () => {
    if (!selectedBudget) return;
    
    if (expenseAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter an amount greater than zero.'
      });
      return;
    }
    
    const success = await updateBudgetSpent(selectedBudget.id, selectedBudget.spent + expenseAmount);
    if (success) {
      // Update local state
      setBudgets(budgets.map(budget => 
        budget.id === selectedBudget.id 
          ? { ...budget, spent: budget.spent + expenseAmount } 
          : budget
      ));
      setExpenseAmount(0);
      setSelectedBudget(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Budgets</h1>
          </div>
          <div className="h-20 flex items-center justify-center">
            <p className="text-muted-foreground">Loading budgets...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Budgets</h1>
          <Button asChild>
            <Link to="/budget/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Budget
            </Link>
          </Button>
        </div>
        
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
              <p className="text-muted-foreground text-center">
                You haven't created any budgets yet.
              </p>
              <Button asChild>
                <Link to="/budget/create">Create First Budget</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {budgets.map((budget) => {
              const percentage = calculateBudgetPercentage(budget.spent, budget.limit);
              
              return (
                <Card key={budget.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle>{budget.category}</CardTitle>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setSelectedBudget(budget)}
                          >
                            <PlusCircleIcon className="h-4 w-4" />
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
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{budget.timeframe}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                        </span>
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BudgetList;
