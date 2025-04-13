
import { Home, PieChart, Calendar, CreditCard, Settings, LogOut, FileText, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar = ({ onClose, collapsed = false, toggleCollapse }: SidebarProps) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: PieChart, label: "Analytics", href: "/analytics" },
    { icon: FileText, label: "Transactions", href: "/transactions" },
    { icon: Calendar, label: "Budget", href: "/budget" },
    { icon: CreditCard, label: "Debt Tracker", href: "/debt" },
    { icon: Calendar, label: "Subscriptions", href: "/bills" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-border transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between py-4 px-2">
        {!collapsed && (
          <>
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/872a462f-ad84-4f9e-af7a-16eb46bfbf2b.png" alt="Logo" className="w-8 h-8" />
              <h1 className="font-bold text-2xl">
                <span className="text-[#f0c138]">Dhan</span>
                <span>Ji</span>
              </h1>
            </div>
          </>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <img src="/lovable-uploads/872a462f-ad84-4f9e-af7a-16eb46bfbf2b.png" alt="Logo" className="w-8 h-8" />
          </div>
        )}
        {toggleCollapse && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapse}
            className="absolute -right-3 top-6 bg-background border border-border rounded-full shadow-md z-10"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed ? "rotate-180" : "")} />
          </Button>
        )}
      </div>

      <nav className="flex-1 pt-8 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                onClick={(e) => {
                  if (onClose) {
                    e.preventDefault();
                    onClose();
                    window.location.href = item.href;
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "px-0 justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
