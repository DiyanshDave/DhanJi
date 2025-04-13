
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtOverview } from "@/components/bills/DebtOverview";
import { getDebts } from "@/services/supabase-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DebtTrackerPage = () => {
  const { data: debts = [], isLoading } = useQuery({
    queryKey: ["debts"],
    queryFn: getDebts,
  });

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debt Tracker</h1>
        <p className="text-muted-foreground">Manage and track all your debts in one place</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Debts</TabsTrigger>
          <TabsTrigger value="credit-card">Credit Cards</TabsTrigger>
          <TabsTrigger value="loan">Loans</TabsTrigger>
          <TabsTrigger value="emi">EMIs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <DebtOverview debts={debts} loading={isLoading} />
        </TabsContent>
        
        <TabsContent value="credit-card" className="mt-4">
          <DebtOverview 
            debts={debts.filter(debt => debt.type === 'credit-card')} 
            loading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="loan" className="mt-4">
          <DebtOverview 
            debts={debts.filter(debt => debt.type === 'loan')} 
            loading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="emi" className="mt-4">
          <DebtOverview 
            debts={debts.filter(debt => debt.type === 'emi')} 
            loading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default DebtTrackerPage;
