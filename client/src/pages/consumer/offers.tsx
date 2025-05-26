import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Intent, Offer } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { OfferListItem } from "@/components/offer/offer-list-item";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IntentDetails } from "@/components/intent/intent-details";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tag, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConsumerOffers() {
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch user's intents
  const { data: intents, isLoading: isIntentsLoading } = useQuery<Intent[]>({
    queryKey: ["/api/user/intents"],
  });
  
  // For simplicity, we'll just show offers for the first intent
  // In a real app, you would fetch all offers for all intents and apply filters
  const firstIntentId = intents && intents.length > 0 ? intents[0].id : undefined;
  
  // Fetch offers for the first intent
  const { data: offers, isLoading: isOffersLoading } = useQuery<Offer[]>({
    queryKey: [`/api/intents/${firstIntentId}/offers`],
    enabled: !!firstIntentId,
  });
  
  // Filter offers based on status and search query
  const filteredOffers = offers?.filter(offer => {
    // Status filter
    if (statusFilter !== "all" && offer.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        offer.company.toLowerCase().includes(query) ||
        offer.product.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) || [];
  
  // Handle view intent details
  const handleViewIntent = (intentId: number) => {
    const intent = intents?.find(i => i.id === intentId);
    if (intent) {
      setSelectedIntent(intent);
    }
  };
  
  const isLoading = isIntentsLoading || isOffersLoading;
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Offers</h1>
            <p className="mt-1 text-sm text-gray-500">View and compare offers from producers</p>
          </div>
          
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search offers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="price-low">Price: Low to high</SelectItem>
                  <SelectItem value="price-high">Price: High to low</SelectItem>
                  <SelectItem value="discount">Highest discount</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                More Filters
              </Button>
            </div>
            
            <Tabs defaultValue="all" onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All Offers</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Offers List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Offers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
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
              ) : filteredOffers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredOffers.map(offer => (
                    <OfferListItem 
                      key={offer.id} 
                      offer={offer} 
                      intentId={offer.intentId}
                      viewMode="consumer"
                    />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">No offers found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {statusFilter !== "all" 
                      ? `You don't have any ${statusFilter} offers.`
                      : searchQuery 
                        ? "Try adjusting your search query."
                        : "Create a purchase intent to start receiving offers."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Intent Summary Cards */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Purchase Intents</h2>
            {isIntentsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-5 w-24 ml-3" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : intents && intents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {intents.slice(0, 3).map(intent => (
                  <Card key={intent.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{intent.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${intent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      `}>
                        {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{intent.timeframe}</p>
                      <p>
                        {intent.budgetMin && intent.budgetMax
                          ? `$${intent.budgetMin.toLocaleString()} - $${intent.budgetMax.toLocaleString()}`
                          : "Budget not specified"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewIntent(intent.id)}
                      >
                        View Offers
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p>No purchase intents found</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Intent Details Modal */}
      <Dialog open={!!selectedIntent} onOpenChange={() => setSelectedIntent(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedIntent && <IntentDetails intent={selectedIntent} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
