
import MainLayout from "@/components/layouts/MainLayout";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-IN", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </div>
        </div>
        
        {/* Financial Overview Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Financial Overview</h2>
          <FinancialOverview />
        </section>
        
        {/* Secondary Dashboard Widgets */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RecentTransactions />
          <BudgetOverview />
          <UpcomingBills />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
