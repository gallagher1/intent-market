import { Intent } from "@shared/schema";
import { useState } from "react";
import { CalendarDays, DollarSign, CheckCircle, Refrigerator, Laptop, Sofa } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IntentCardProps {
  intent: Intent;
  onViewOffers: (intentId: number) => void;
  onEdit: (intent: Intent) => void;
}

export function IntentCard({ intent, onViewOffers, onEdit }: IntentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Choose icon based on intent title
  const getIcon = () => {
    const title = intent.title.toLowerCase();
    if (title.includes("refrigerator") || title.includes("fridge")) {
      return <Refrigerator className="h-5 w-5 text-primary-600" />;
    } else if (title.includes("laptop") || title.includes("computer")) {
      return <Laptop className="h-5 w-5 text-primary-600" />;
    } else {
      return <Sofa className="h-5 w-5 text-primary-600" />;
    }
  };
  
  return (
    <div 
      className="bg-white shadow rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-md p-2 mr-3">
              {getIcon()}
            </div>
            <h3 className="text-lg font-medium text-gray-900">{intent.title}</h3>
          </div>
          <Badge 
            variant={intent.status === "active" ? "success" : "secondary"}
            className={`
              px-2.5 py-0.5 rounded-full text-xs font-medium 
              ${intent.status === "active" ? "bg-green-100 text-green-800" : ""}
            `}
          >
            {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
          </Badge>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span>{intent.timeframe}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>
              {intent.budgetMin && intent.budgetMax 
                ? `$${intent.budgetMin.toLocaleString()} - $${intent.budgetMax.toLocaleString()}`
                : "Budget not specified"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>0 offers received</span>
          </div>
        </div>
        
        <div className="mt-5 flex flex-wrap gap-2">
          {intent.features && intent.features.map((feature, index) => (
            <Badge 
              key={index} 
              variant="outline"
              className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
            >
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="mt-5 flex space-x-3">
          <Button 
            variant="outline"
            className="flex-1 bg-primary-100 border-0 text-primary-700 hover:bg-primary-200"
            onClick={() => onViewOffers(intent.id)}
          >
            View Offers
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => onEdit(intent)}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
