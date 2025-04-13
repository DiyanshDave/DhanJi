
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { getTransactions, formatCurrency, deleteTransaction } from "@/services/supabase-service";
import { Transaction } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  LineChart, 
  Building, 
  Plus, 
  Trash2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Transactions</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Sort transactions by date (newest first)
  // This approach ensures most recently added transactions appear first when dates are the same
  const sortedTransactions = [...transactions].sort((a, b) => {
    // First compare by date
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // If dates are the same, use the transaction ID as a fallback
    // This assumes newer transactions have higher/later IDs
    return b.id.localeCompare(a.id);
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <Button onClick={() => navigate("/transactions/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>

        {sortedTransactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground text-center">
                You haven't added any transactions yet.
              </p>
              <Button onClick={() => navigate("/transactions/add")}>
                <Plus className="mr-2 h-4 w-4" /> Add First Transaction
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View and manage all your financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <span>{transaction.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className={transaction.type === "income" || transaction.type === "saving" ? "text-dhanji-income" : "text-dhanji-expense"}>
                        {transaction.type === "income" || transaction.type === "saving" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setTransactionToDelete(transaction.id)}
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

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
    </MainLayout>
  );
};

export default TransactionsPage;
