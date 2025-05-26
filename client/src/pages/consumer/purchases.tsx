import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Purchase, Intent, Offer } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ShoppingCart, Store, Tag, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ConsumerPurchases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Fetch user's purchases
  const { data: purchases, isLoading: isPurchasesLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/user/purchases"],
  });
  
  // Fetch user's intents (to get titles)
  const { data: intents, isLoading: isIntentsLoading } = useQuery<Intent[]>({
    queryKey: ["/api/user/intents"],
  });
  
  // Ideally, we would have an endpoint to get complete purchase details
  // For this example, we'll join the data client-side
  
  // Filter purchases based on search query
  const filteredPurchases = purchases?.filter(purchase => {
    if (!searchQuery) return true;
    
    const intent = intents?.find(i => i.id === purchase.intentId);
    if (!intent) return false;
    
    return intent.title.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];
  
  // Sort purchases by completion date
  const sortedPurchases = [...(filteredPurchases || [])].sort((a, b) => {
    const dateA = new Date(a.completedAt).getTime();
    const dateB = new Date(b.completedAt).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };
  
  const isLoading = isPurchasesLoading || isIntentsLoading;
  
  // Helper to get intent title
  const getIntentTitle = (intentId: number) => {
    const intent = intents?.find(i => i.id === intentId);
    return intent?.title || "Unknown Intent";
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Completed Purchases</h1>
            <p className="mt-1 text-sm text-gray-500">View your purchase history</p>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Purchases</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {isLoading ? <Skeleton className="h-8 w-12" /> : purchases?.length || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <Tag className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">With Offers</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {isLoading ? (
                            <Skeleton className="h-8 w-12" />
                          ) : (
                            purchases?.filter(p => p.offerId).length || 0
                          )}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                    <Calendar className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Latest Purchase</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {isLoading ? (
                            <Skeleton className="h-8 w-28" />
                          ) : purchases && purchases.length > 0 ? (
                            format(new Date(purchases[0].completedAt), "MMM d, yyyy")
                          ) : (
                            "None"
                          )}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search purchases..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={toggleSortOrder}
            >
              <span>Sort by Date</span>
              {sortOrder === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Purchases List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase History</CardTitle>
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
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-8 w-20 ml-auto mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedPurchases.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {sortedPurchases.map(purchase => (
                    <li key={purchase.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <ShoppingCart className="text-gray-500 h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getIntentTitle(purchase.intentId)}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Completed
                            </Badge>
                            <span className="ml-2 text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(purchase.completedAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          {purchase.offerId && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <Store className="h-3 w-3 mr-1" />
                              Purchased with offer
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">No purchases found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery 
                      ? "Try adjusting your search query."
                      : "Complete a purchase to see it here."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
