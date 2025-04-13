import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTransactions } from "@/services/supabase-service";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Skeleton } from "@/components/ui/skeleton";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  // Process transaction data for charts
  const processDataForCharts = () => {
    // Expense by category
    const expenseCategories: Record<string, number> = {};
    // Income by category
    const incomeCategories: Record<string, number> = {};
    // Monthly trends
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        incomeCategories[transaction.category] = 
          (incomeCategories[transaction.category] || 0) + transaction.amount;
        monthlyData[monthYear].income += transaction.amount;
      } else {
        expenseCategories[transaction.category] = 
          (expenseCategories[transaction.category] || 0) + transaction.amount;
        monthlyData[monthYear].expense += transaction.amount;
      }
    });

    return { expenseCategories, incomeCategories, monthlyData };
  };

  const { expenseCategories, incomeCategories, monthlyData } = processDataForCharts();

  // Prepare chart data
  const expenseByCategoryData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(expenseCategories),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const incomeByCategoryData = {
    labels: Object.keys(incomeCategories),
    datasets: [
      {
        label: "Income by Category",
        data: Object.values(incomeCategories),
        backgroundColor: [
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC249",
          "#FFD700",
        ],
      },
    ],
  };

  const monthlyTrendsData = {
    labels: Object.keys(monthlyData).sort(),
    datasets: [
      {
        label: "Income",
        data: Object.keys(monthlyData).sort().map((month) => monthlyData[month].income),
        borderColor: "#4BC0C0",
        backgroundColor: "#4BC0C0",
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: Object.keys(monthlyData).sort().map((month) => monthlyData[month].expense),
        borderColor: "#FF6384",
        backgroundColor: "#FF6384",
        tension: 0.1,
      },
    ],
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Analytics</h1>
        <p className="text-muted-foreground">
          Visualize your income and expenses with interactive charts
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Line
                    data={monthlyTrendsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Bar
                    data={{
                      labels: ["Total"],
                      datasets: [
                        {
                          label: "Income",
                          data: [Object.values(incomeCategories).reduce((a, b) => a + b, 0)],
                          backgroundColor: "#4BC0C0",
                        },
                        {
                          label: "Expenses",
                          data: [Object.values(expenseCategories).reduce((a, b) => a + b, 0)],
                          backgroundColor: "#FF6384",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Pie
                    data={expenseByCategoryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Bar
                    data={expenseByCategoryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Pie
                    data={incomeByCategoryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Income Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Bar
                    data={incomeByCategoryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AnalyticsPage;
