
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import Dashboard from "@/pages/Dashboard";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  // If user is authenticated, show dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - Branding and Description */}
        <div className="w-full lg:w-1/2 bg-[#62b3d0]/10 dark:bg-[#62b3d0]/20 animated-bg p-8 lg:p-16 flex flex-col justify-center">
          <div className="space-y-6 max-w-xl mx-auto lg:mx-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#f0c138] text-white p-3 rounded-full">
                <img src="/lovable-uploads/872a462f-ad84-4f9e-af7a-16eb46bfbf2b.png" alt="Logo" className="h-8 w-8" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">
                <span className="text-[#f0c138]">Dhan</span>Ji
              </h1>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-semibold">
              Your Personal Finance Guru
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Track your expenses, manage budgets, plan your investments, and achieve financial freedom with DhanJi's comprehensive financial tools.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-bold mb-1">Expense Tracking</h3>
                <p className="text-sm">Monitor your spending habits and identify areas to save.</p>
              </div>
              <div className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-bold mb-1">Budget Planning</h3>
                <p className="text-sm">Create and manage budgets to meet your financial goals.</p>
              </div>
              <div className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-bold mb-1">Debt Management</h3>
                <p className="text-sm">Prioritize and eliminate your debts strategically.</p>
              </div>
              <div className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-bold mb-1">Bill Splitting</h3>
                <p className="text-sm">Easily split and track shared expenses with friends.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            {showLogin ? (
              <LoginForm onToggleForm={() => setShowLogin(false)} />
            ) : (
              <SignupForm onToggleForm={() => setShowLogin(true)} />
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-background border-t border-border py-6 px-8 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} DhanJi. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
