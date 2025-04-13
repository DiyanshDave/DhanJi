
import { Transaction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialDayDetailsProps {
  date: Date;
  transactions: Transaction[];
}

const FinancialDayDetails = ({ date, transactions }: FinancialDayDetailsProps) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Summary</h3>
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-3">
              <div className="text-xs text-green-700 dark:text-green-400 font-medium">Income</div>
              <div className="font-bold text-green-600 dark:text-green-300">{totalIncome}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-3">
              <div className="text-xs text-red-700 dark:text-red-400 font-medium">Expense</div>
              <div className="font-bold text-red-600 dark:text-red-300">{totalExpense}</div>
            </CardContent>
          </Card>
          <Card className={cn(
            netAmount >= 0 
              ? "bg-green-50 dark:bg-green-900/20" 
              : "bg-red-50 dark:bg-red-900/20"
          )}>
            <CardContent className="p-3">
              <div className="text-xs font-medium">Net</div>
              <div className={cn(
                "font-bold",
                netAmount >= 0 
                  ? "text-green-600 dark:text-green-300" 
                  : "text-red-600 dark:text-red-300"
              )}>
                {netAmount}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No transactions for this day</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(transaction => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    transaction.type === 'income' 
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description || transaction.category}</div>
                    <div className="text-xs text-muted-foreground">{transaction.category}</div>
                  </div>
                </div>
                <div className={cn(
                  "font-medium",
                  transaction.type === 'income' 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                )}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDayDetails;
