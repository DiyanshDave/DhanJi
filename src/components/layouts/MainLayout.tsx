
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import Sidebar from "@/components/ui/sidebar-custom";
import TopBar from "@/components/ui/TopBar";
import MobileNav from "@/components/ui/MobileNav";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Check local storage for sidebar preference on initial load
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);
  
  // Save sidebar state to local storage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:block fixed left-0 top-0 bottom-0 z-50 transition-all duration-300", 
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <Sidebar 
          collapsed={sidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div 
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <TopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <div className="md:hidden">
          <MobileNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
