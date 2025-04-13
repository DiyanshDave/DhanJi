
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getTransactions } from "@/services/supabase-service";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FinancialDayDetails from "@/components/calendar/FinancialDayDetails";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{ date: Date, amount: number } | null>(null);

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const getDailySummaries = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const dailySummaries: Record<string, number> = {};
    
    days.forEach(day => {
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getDate() === day.getDate() &&
          transactionDate.getMonth() === day.getMonth() &&
          transactionDate.getFullYear() === day.getFullYear()
        );
      });
      
      let dailySum = 0;
      dayTransactions.forEach(t => {
        if (t.type === 'income') {
          dailySum += t.amount;
        } else if (t.type === 'expense') {
          dailySum -= t.amount;
        }
      });
      
      dailySummaries[format(day, 'yyyy-MM-dd')] = dailySum;
    });
    
    return dailySummaries;
  };

  const dailySummaries = getDailySummaries();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const amount = dailySummaries[formattedDate] || 0;
      setSelectedDayDetails({ date, amount });
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Calendar</h1>
        <p className="text-muted-foreground">Track your daily financial activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="flex-1">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full max-w-lg pointer-events-auto"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              }}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  const formattedDay = format(date, 'yyyy-MM-dd');
                  const amount = dailySummaries[formattedDay] || 0;
                  
                  const isOutsideMonth = !isSameMonth(date, displayMonth);
                  
                  return (
                    <div
                      {...props}
                      className={cn(
                        "relative h-10 w-10 p-0 font-normal aria-selected:opacity-100 cursor-pointer",
                        isOutsideMonth && "opacity-50"
                      )}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{format(date, 'd')}</span>
                        {!isOutsideMonth && amount !== 0 && (
                          <span 
                            className={cn(
                              "text-xs font-medium",
                              amount > 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {amount > 0 ? '+' : ''}{amount}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDayDetails 
                ? format(selectedDayDetails.date, 'MMMM d, yyyy') 
                : format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayDetails ? (
              <FinancialDayDetails 
                date={selectedDayDetails.date} 
                transactions={transactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  const selectedDay = selectedDayDetails.date;
                  return (
                    transactionDate.getDate() === selectedDay.getDate() &&
                    transactionDate.getMonth() === selectedDay.getMonth() &&
                    transactionDate.getFullYear() === selectedDay.getFullYear()
                  );
                })}
              />
            ) : (
              <div className="text-center text-muted-foreground py-10">
                Select a day to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
