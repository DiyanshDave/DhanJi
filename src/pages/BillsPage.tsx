import MainLayout from "@/components/layouts/MainLayout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscriptions, getDebts, deleteSubscription, formatCurrency } from "@/services/supabase-service";
import { Subscription, Debt } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const BillsPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const subscriptionsData = await getSubscriptions();
    const debtsData = await getDebts();
    setSubscriptions(subscriptionsData);
    setDebts(debtsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleAddBill = () => {
    navigate("/bills/add");
  };

  const handleDelete = async (id: string, type: string) => {
    if (type === "subscription") {
      const success = await deleteSubscription(id);
      if (success) {
        toast.success("Subscription removed successfully");
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      } else {
        toast.error("Failed to delete subscription");
      }
    } else {
      toast.error("Debt deletion not implemented yet");
    }
  };

  const allBills = [
    ...subscriptions.map(sub => ({
      id: sub.id,
      title: sub.name,
      amount: sub.amount,
      dueDate: sub.nextBillingDate,
      frequency: sub.frequency,
      category: sub.category,
      type: "subscription"
    })),
    ...debts.map(debt => ({
      id: debt.id,
      title: debt.name,
      amount: debt.minimumPayment,
      dueDate: debt.dueDate,
      frequency: "monthly",
      category: "Debt",
      type: debt.type
    }))
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getDueStatus = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return "Overdue";
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue <= 3) return "Due soon";
    return `Due in ${daysUntilDue} days`;
  };

  const getStatusClass = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return "text-dhanji-danger";
    if (daysUntilDue <= 3) return "text-dhanji-warning";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Bills & Subscriptions</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading bills...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bills & Subscriptions</h1>
          <Button onClick={handleAddBill}>
            <Plus className="mr-2 h-4 w-4" /> Add Bill
          </Button>
        </div>

        {allBills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground text-center">
                You haven't added any bills or subscriptions yet.
              </p>
              <Button onClick={handleAddBill}>
                <Plus className="mr-2 h-4 w-4" /> Add First Bill
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Bills</CardTitle>
              <CardDescription>
                Manage all your subscriptions and bill payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                            {bill.type === "subscription" ? (
                              <Calendar className="h-4 w-4 text-dhanji-purple" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-dhanji-expense" />
                            )}
                          </div>
                          <span>{bill.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{bill.category}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell className="capitalize">{bill.frequency}</TableCell>
                      <TableCell>{formatDate(bill.dueDate)}</TableCell>
                      <TableCell className={getStatusClass(bill.dueDate)}>
                        {getDueStatus(bill.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(bill.id, bill.type)}>
                          <Trash2 className="h-4 w-4" />
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
    </MainLayout>
  );
};

export default BillsPage;
