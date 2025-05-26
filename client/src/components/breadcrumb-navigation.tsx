import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  value?: string;
  onClick?: () => void;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  currentView: string;
  onNavigate: (view: string) => void;
}

export function BreadcrumbNavigation({ items, currentView, onNavigate }: BreadcrumbNavigationProps) {
  const breadcrumbItems = [
    { label: "Dashboard", value: "dashboard", onClick: () => onNavigate("dashboard") },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("dashboard")}
        className="h-auto p-1 text-gray-500 hover:text-gray-700"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.onClick ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className="h-auto p-1 text-gray-500 hover:text-gray-700"
            >
              {item.label}
            </Button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}