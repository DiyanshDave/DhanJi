
import { Home, PieChart, Calendar, CreditCard, Menu, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MobileNav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const menuItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: PieChart, label: "Analytics", href: "/analytics" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: CreditCard, label: "Debt", href: "/debt" },
    { icon: Menu, label: "More", href: "#more" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-10">
      <nav className="flex justify-around items-center h-16">
        {menuItems.map((item, index) => (
          item.href !== "#more" ? (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "text-muted-foreground hover:text-foreground transition-colors",
                location.pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ) : (
            <Button
              key={item.label}
              variant="ghost"
              className="flex flex-col items-center justify-center flex-1 h-full rounded-none text-muted-foreground hover:text-foreground transition-colors"
              onClick={toggleSidebar}
            >
              <PanelLeft className="w-5 h-5 mb-1" />
              <span className="text-xs">Menu</span>
            </Button>
          )
        ))}
      </nav>
    </div>
  );
};

export default MobileNav;
