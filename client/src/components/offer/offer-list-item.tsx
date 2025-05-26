import { Offer } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Store, AlertCircle, Calendar, BadgeCheck, Badge, BadgeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";

interface OfferListItemProps {
  offer: Offer;
  intentId: number;
  viewMode: "consumer" | "producer";
}

export function OfferListItem({ offer, intentId, viewMode }: OfferListItemProps) {
  const { toast } = useToast();
  
  // Calculate remaining days until expiration
  const daysRemaining = offer.expiresAt 
    ? Math.max(0, Math.ceil((new Date(offer.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  
  const acceptOfferMutation = useMutation({
    mutationFn: async () => {
      const purchaseData = {
        intentId,
        offerId: offer.id,
      };
      const res = await apiRequest("POST", "/api/purchases", purchaseData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Offer accepted",
        description: "You have successfully completed this purchase.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/intents/${intentId}/offers`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAcceptOffer = () => {
    if (confirm("Are you sure you want to accept this offer and mark the purchase as completed?")) {
      acceptOfferMutation.mutate();
    }
  };
  
  return (
    <li className="p-4 hover:bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
          <Store className="text-gray-500 h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {offer.company}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {offer.product}
          </p>
          <div className="flex items-center mt-1">
            {offer.discount && (
              <UIBadge 
                className="text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full"
              >
                {offer.discount}
              </UIBadge>
            )}
            {daysRemaining !== null && (
              <span className="ml-2 text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {daysRemaining === 0
                  ? "Expires today"
                  : daysRemaining === 1
                  ? "Expires tomorrow"
                  : `Expires in ${daysRemaining} days`}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">${offer.price.toLocaleString()}</p>
          {offer.originalPrice && (
            <p className="text-xs text-gray-500 line-through">${offer.originalPrice.toLocaleString()}</p>
          )}
          <div className="mt-2">
            {viewMode === "consumer" && offer.status === "pending" && (
              <Button 
                size="sm"
                variant="outline"
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                onClick={handleAcceptOffer}
                disabled={acceptOfferMutation.isPending}
              >
                {acceptOfferMutation.isPending ? "Processing..." : "Accept Offer"}
              </Button>
            )}
            {viewMode === "consumer" && offer.status !== "pending" && (
              <UIBadge 
                variant={offer.status === "accepted" ? "success" : "secondary"}
                className={`
                  px-2.5 py-0.5 text-xs font-medium 
                  ${offer.status === "accepted" ? "bg-green-100 text-green-800" : ""}
                `}
              >
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </UIBadge>
            )}
            {viewMode === "producer" && (
              <Button 
                size="sm"
                variant="outline"
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
