
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Debt } from "@/types";
import { formatCurrency, getDebts, deleteDebt } from "@/services/supabase-service";
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
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Building, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DebtOverviewProps {
  debts: Debt[];
  loading: boolean;
}

export const DebtOverview = ({ debts, loading }: DebtOverviewProps) => {
  const navigate = useNavigate();

  // Calculate total debt amount
  const totalDebtAmount = debts.reduce((total, debt) => total + debt.remainingAmount, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleDelete = async (id: string) => {
    const success = await deleteDebt(id);
    if (success) {
      toast.success("Debt removed successfully");
    } else {
      toast.error("Failed to delete debt");
    }
  };

  const getDebtIcon = (type: string) => {
    switch (type) {
      case "credit-card":
        return <CreditCard className="h-4 w-4 text-dhanji-expense" />;
      case "loan":
        return <Building className="h-4 w-4 text-dhanji-warning" />;
      case "emi":
        return <Calendar className="h-4 w-4 text-dhanji-purple" />;
      default:
        return <Banknote className="h-4 w-4 text-dhanji-expense" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "credit-card":
        return "Credit Card";
      case "loan":
        return "Loan";
      case "emi":
        return "EMI";
      default:
        return "Other";
    }
  };

  const getPaymentProgress = (total: number, remaining: number) => {
    if (total <= 0) return 0;
    const paid = total - remaining;
    return Math.max(0, Math.min(100, (paid / total) * 100));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt Tracker</CardTitle>
          <CardDescription>Loading your debts...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <p className="text-muted-foreground">Loading debt information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Debt Tracker</CardTitle>
            <CardDescription>
              Track and manage your credit cards, loans, and EMIs
            </CardDescription>
          </div>
          <Button onClick={() => navigate("/bills/add")} variant="outline">
            Add Debt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Total Debt Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Total Debt</h3>
            <span className={`text-xl font-bold ${totalDebtAmount > 0 ? 'text-dhanji-expense' : 'text-dhanji-income'}`}>
              {formatCurrency(totalDebtAmount)}
            </span>
          </div>
          {debts.length > 0 && (
            <div className="space-y-1">
              {debts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getDebtIcon(debt.type)}
                    <span>{debt.name}</span>
                  </div>
                  <span className="text-dhanji-expense">{formatCurrency(debt.remainingAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {debts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't added any debts yet.</p>
            <Button onClick={() => navigate("/bills/add")}>
              Add Your First Debt
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                        {getDebtIcon(debt.type)}
                      </div>
                      <span>{debt.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {getTypeLabel(debt.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-dhanji-expense">
                    {formatCurrency(debt.remainingAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="w-full space-y-1">
                      <Progress value={getPaymentProgress(debt.totalAmount, debt.remainingAmount)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {formatCurrency(debt.totalAmount - debt.remainingAmount)} paid
                        </span>
                        <span>
                          {formatCurrency(debt.totalAmount)} total
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(debt.dueDate)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(debt.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
