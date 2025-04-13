
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/services/supabase-service";
import MainLayout from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/services/supabase-service";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  
  // Fetch transaction data
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  // Process data for charts
  const processChartData = () => {
    if (!transactions || transactions.length === 0) return { 
      categoryData: [], 
      spendingTrend: [],
      incomeVsExpense: [] 
    };

    // Group transactions by category for pie chart
    const categoryMap = new Map();
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      }
    });

    const categoryData = Array.from(categoryMap, ([name, value]) => ({ 
      name, 
      value: Number(value) 
    })).sort((a, b) => b.value - a.value);

    // Group by date for trend analysis
    const dateMap = new Map();
    const today = new Date();
    
    // Create date range based on selected period
    let startDate = new Date();
    if (selectedPeriod === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= startDate) {
        // Format date consistently
        const dateKey = transactionDate.toISOString().split('T')[0];
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { 
            date: dateKey, 
            expense: 0, 
            income: 0 
          });
        }
        
        const record = dateMap.get(dateKey);
        if (transaction.type === 'expense') {
          record.expense += transaction.amount;
        } else if (transaction.type === 'income') {
          record.income += transaction.amount;
        }
      }
    });

    // Sort dates for trend analysis
    const spendingTrend = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Summarize income vs expense by category
    const typeMap = new Map();
    transactions.forEach(transaction => {
      if (!typeMap.has(transaction.type)) {
        typeMap.set(transaction.type, 0);
      }
      typeMap.set(transaction.type, typeMap.get(transaction.type) + transaction.amount);
    });

    const incomeVsExpense = Array.from(typeMap, ([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value: Number(value) 
    }));

    return { categoryData, spendingTrend, incomeVsExpense };
  };

  const { categoryData, spendingTrend, incomeVsExpense } = processChartData();

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!transactions || transactions.length === 0) return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      savings: 0
    };

    let totalIncome = 0;
    let totalExpense = 0;
    let savings = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        totalExpense += transaction.amount;
      } else if (transaction.type === 'saving') {
        savings += transaction.amount;
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      savings
    };
  };

  const summary = calculateSummary();

  // Colors for charts
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];
  const TYPE_COLORS = {
    income: '#4ade80',
    expense: '#f87171',
    saving: '#60a5fa',
    investment: '#c084fc'
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
            <p className="text-muted-foreground">
              Track and visualize your financial activity
            </p>
          </div>
          
          <Tabs 
            defaultValue="month" 
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as "week" | "month" | "year")}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-[140px]" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 font-medium flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      Income
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-[140px]" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(summary.totalExpense)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-rose-500 font-medium flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      Expenses
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-[140px]" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={`font-medium flex items-center gap-1 ${summary.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {summary.balance >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {summary.balance >= 0 ? 'Positive' : 'Negative'} balance
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-[140px]" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(summary.savings)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-blue-500 font-medium flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      Savings
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense by Category */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
              <CardDescription>
                Breakdown of your expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-[300px] w-[300px] rounded-full" />
                </div>
              ) : categoryData.length > 0 ? (
                <ChartContainer 
                  config={{
                    ...categoryData.reduce((acc, item, index) => {
                      acc[item.name] = {
                        label: item.name,
                        color: COLORS[index % COLORS.length]
                      };
                      return acc;
                    }, {})
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  No expense data to display
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Income vs Expense */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Income vs Expense</CardTitle>
              <CardDescription>
                Comparison of your income and expense
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : incomeVsExpense.length > 0 ? (
                <ChartContainer 
                  config={{
                    Income: {
                      label: "Income",
                      color: TYPE_COLORS.income
                    },
                    Expense: {
                      label: "Expense",
                      color: TYPE_COLORS.expense
                    },
                    Saving: {
                      label: "Saving",
                      color: TYPE_COLORS.saving
                    },
                    Investment: {
                      label: "Investment",
                      color: TYPE_COLORS.investment
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incomeVsExpense}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Amount" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      >
                        {incomeVsExpense.map((entry, index) => {
                          const color = TYPE_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length];
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  No data to display
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Spending Trend */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending Trend</CardTitle>
              <CardDescription>
                Your income and expense trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : spendingTrend.length > 0 ? (
                <ChartContainer 
                  config={{
                    income: {
                      label: "Income",
                      color: TYPE_COLORS.income
                    },
                    expense: {
                      label: "Expense",
                      color: TYPE_COLORS.expense
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={spendingTrend}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={TYPE_COLORS.income} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={TYPE_COLORS.income} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={TYPE_COLORS.expense} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={TYPE_COLORS.expense} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }} 
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke={TYPE_COLORS.income} 
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        stroke={TYPE_COLORS.expense} 
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  No trend data to display
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
