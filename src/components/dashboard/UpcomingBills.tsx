
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Trash2 } from "lucide-react";
import { getSubscriptions, formatCurrency, getDebts, deleteSubscription } from "@/services/supabase-service";
import { Subscription } from "@/types";
import { Debt } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const UpcomingBills = () => {
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

  // Combine subscriptions and debts
  const allBills = [
    ...subscriptions.map(sub => ({
      id: sub.id,
      title: sub.name,
      amount: sub.amount,
      dueDate: sub.nextBillingDate,
      type: "subscription"
    })),
    ...debts.map(debt => ({
      id: debt.id,
      title: debt.name,
      amount: debt.minimumPayment,
      dueDate: debt.dueDate,
      type: debt.type
    }))
  ];

  // Sort by due date (closest first)
  const upcomingBills = allBills
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  };

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const handleAddBill = () => {
    navigate("/bills/add");
  };

  const handleViewAll = () => {
    navigate("/bills");
  };

  const handleDelete = async (id: string, type: string) => {
    if (type === "subscription") {
      const success = await deleteSubscription(id);
      if (success) {
        toast.success("Subscription removed successfully");
        // Update local state to reflect the deletion
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      } else {
        toast.error("Failed to delete subscription");
      }
    } else {
      // Handle debt deletion here when implemented
      toast.error("Debt deletion not implemented yet");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <p className="text-muted-foreground">Loading bills...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0 && debts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
          <p className="text-muted-foreground text-center">
            You haven't added any subscriptions or bills yet.
          </p>
          <Button onClick={handleAddBill}>
            Add First Bill
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Bills</CardTitle>
        <Button variant="link" onClick={handleViewAll}>View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBills.map((bill) => {
            const daysUntilDue = getDaysUntilDue(bill.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

            return (
              <div key={bill.id} className="flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    {bill.type === "subscription" ? (
                      <Calendar className="h-5 w-5 text-dhanji-purple" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-dhanji-expense" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{bill.title}</div>
                    <div
                      className={`text-sm ${
                        isOverdue
                          ? "text-dhanji-danger"
                          : isDueSoon
                            ? "text-dhanji-warning"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntilDue)} days`
                        : daysUntilDue === 0
                          ? "Due today"
                          : `Due in ${daysUntilDue} days`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(bill.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(bill.dueDate)}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={() => handleDelete(bill.id, bill.type)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <Button onClick={handleAddBill} variant="outline" className="w-full">
            Add New Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
