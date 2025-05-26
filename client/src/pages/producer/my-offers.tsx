import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Offer } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
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
import { Search, Calendar, Target, Store, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyOffers() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch producer's offers
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/user/offers"],
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">My Offers</h1>
            <p className="mt-1 text-sm text-gray-500">Track and manage your offers to consumers</p>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-10 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Offers</h3>
                    <p className="text-2xl font-semibold mt-1">{offers?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    <p className="text-2xl font-semibold mt-1">
                      {offers?.filter(o => o.status === "pending").length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium text-gray-500">Accepted</h3>
                    <p className="text-2xl font-semibold mt-1 text-green-600">
                      {offers?.filter(o => o.status === "accepted").length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium text-gray-500">Expired/Rejected</h3>
                    <p className="text-2xl font-semibold mt-1 text-gray-500">
                      {offers?.filter(o => ["expired", "rejected"].includes(o.status)).length || 0}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
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
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
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
              <CardTitle className="text-lg">
                {statusFilter === "all" ? "All Offers" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Offers`}
              </CardTitle>
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
                <div className="divide-y divide-gray-200">
                  {filteredOffers.map(offer => (
                    <div key={offer.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <Target className="text-gray-500 h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {offer.product}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            For intent #{offer.intentId}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge 
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(offer.status)}`}
                            >
                              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                            </Badge>
                            <span className="ml-2 text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(offer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${offer.price.toLocaleString()}</p>
                          {offer.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">${offer.originalPrice.toLocaleString()}</p>
                          )}
                          <div className="mt-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Store className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">No offers found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery 
                      ? "Try adjusting your search query."
                      : statusFilter !== "all" 
                        ? `You don't have any ${statusFilter} offers.`
                        : "Create offers to see them here."}
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
