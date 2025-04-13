
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBudget } from "@/services/supabase-service";
import { toast } from "@/components/ui/use-toast";

const BudgetCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState<number>(0);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || limit <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid category and budget limit.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const budget = await createBudget({
        category,
        limit,
        spent: 0,
        timeframe
      });
      
      if (budget) {
        toast({
          title: "Budget Created",
          description: "Your budget has been created successfully."
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create Budget</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g., Groceries, Entertainment" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Budget Limit</Label>
                <Input 
                  id="limit" 
                  type="number" 
                  placeholder="10000" 
                  value={limit || ""}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  required
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select 
                  value={timeframe} 
                  onValueChange={(value) => setTimeframe(value as "daily" | "weekly" | "monthly" | "yearly")}
                >
                  <SelectTrigger id="timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => navigate("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Budget"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BudgetCreate;
