import { Intent, Offer } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, DollarSign, User, Tag, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OfferListItem } from "@/components/offer/offer-list-item";
import { Skeleton } from "@/components/ui/skeleton";

interface IntentDetailsProps {
  intent: Intent;
}

export function IntentDetails({ intent }: IntentDetailsProps) {
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: [`/api/intents/${intent.id}/offers`],
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{intent.title}</CardTitle>
        <div className="flex items-center justify-between">
          <Badge 
            variant={intent.status === "active" ? "success" : "secondary"}
            className={`
              px-2.5 py-0.5 rounded-full text-xs font-medium 
              ${intent.status === "active" ? "bg-green-100 text-green-800" : ""}
            `}
          >
            {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
          </Badge>
          <span className="text-sm text-gray-500">
            Created {new Date(intent.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-700">
              <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
              <span><strong>Timeframe:</strong> {intent.timeframe}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                <strong>Budget:</strong> {intent.budgetMin && intent.budgetMax 
                  ? `$${intent.budgetMin.toLocaleString()} - $${intent.budgetMax.toLocaleString()}`
                  : "Not specified"}
              </span>
            </div>
          </div>
          
          {intent.features && intent.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Desired Features</h4>
              <div className="flex flex-wrap gap-2">
                {intent.features.map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {intent.brands && intent.brands.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Brands</h4>
              <div className="flex flex-wrap gap-2">
                {intent.brands.map((brand, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Offers</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-4 w-12 ml-auto mt-1" />
                      <Skeleton className="h-8 w-20 ml-auto mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : offers && offers.length > 0 ? (
              <div className="space-y-2">
                {offers.map(offer => (
                  <OfferListItem 
                    key={offer.id} 
                    offer={offer} 
                    intentId={intent.id}
                    viewMode="consumer"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Store className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2">No offers received yet</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
