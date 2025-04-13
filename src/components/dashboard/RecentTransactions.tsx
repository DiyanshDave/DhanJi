
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { getTransactions, formatCurrency, deleteTransaction } from "@/services/supabase-service";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Wallet, LineChart, Building, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";

export const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    const success = await deleteTransaction(transactionToDelete);
    if (success) {
      // Remove the transaction from the state
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => t.id !== transactionToDelete)
      );
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted"
      });
    }
    
    // Close the dialog
    setTransactionToDelete(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
          <p className="text-muted-foreground text-center">
            You haven't added any transactions yet.
          </p>
          <Button onClick={() => navigate('/transactions/add')}>
            Add First Transaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Sort transactions by date (newest first) and get the 5 most recent
  // This approach ensures most recently added transactions appear first when dates are the same
  const latestTransactions = [...transactions]
    .sort((a, b) => {
      // First compare by date
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are the same, use the transaction ID as a fallback
      // This assumes newer transactions have higher/later IDs
      return b.id.localeCompare(a.id);
    })
    .slice(0, 5);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowDownLeft className="h-5 w-5 text-dhanji-income" />;
      case "expense":
        return <ArrowUpRight className="h-5 w-5 text-dhanji-expense" />;
      case "investment":
        return <LineChart className="h-5 w-5 text-dhanji-investment" />;
      case "saving":
        return <Building className="h-5 w-5 text-dhanji-saving" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-dhanji-income";
      case "expense":
        return "text-dhanji-expense";
      case "investment":
        return "text-dhanji-investment";
      case "saving":
        return "text-dhanji-saving";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { 
      day: "numeric", 
      month: "short" 
    });
  };

  const handleViewAll = () => {
    navigate("/transactions");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="link" onClick={handleViewAll} className="flex items-center">
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {latestTransactions.map((transaction) => (
            <ContextMenu key={transaction.id}>
              <ContextMenuTrigger>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">{transaction.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-medium", getAmountColor(transaction.type))}>
                      {transaction.type === "income" || transaction.type === "saving" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(transaction.date)}</div>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem className="text-red-500" onClick={() => setTransactionToDelete(transaction.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setTransactionToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
