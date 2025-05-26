import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Intent } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { CreateOfferForm } from "@/components/offer/create-offer-form";
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
import { Search, Filter, Target, CalendarDays, DollarSign, CheckCircle, PlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BrowseIntents() {
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  
  // Fetch all active intents
  const { data: intents, isLoading } = useQuery<Intent[]>({
    queryKey: ["/api/intents", { status: statusFilter }],
  });
  
  // Filter intents based on search query and price range
  const filteredIntents = intents?.filter(intent => {
    // Status filter is handled by the API

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = intent.title.toLowerCase().includes(query);
      const matchesFeatures = intent.features?.some(feature => 
        feature.toLowerCase().includes(query)
      );
      const matchesBrands = intent.brands?.some(brand => 
        brand.toLowerCase().includes(query)
      );
      
      if (!matchesTitle && !matchesFeatures && !matchesBrands) {
        return false;
      }
    }
    
    // Price filter
    if (priceMin && intent.budgetMin && parseInt(priceMin) > intent.budgetMin) {
      return false;
    }
    
    if (priceMax && intent.budgetMax && parseInt(priceMax) < intent.budgetMax) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Handle make offer
  const handleMakeOffer = (intent: Intent) => {
    setSelectedIntent(intent);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Browse Intents</h1>
            <p className="mt-1 text-sm text-gray-500">Discover consumer purchase intents and make targeted offers</p>
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
                  placeholder="Search intents..."
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
                  <SelectItem value="budget-high">Budget: High to low</SelectItem>
                  <SelectItem value="budget-low">Budget: Low to high</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Tabs defaultValue="active" onValueChange={setStatusFilter}>
                <TabsList className="col-span-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>
              
              <div className="flex col-span-2 space-x-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input 
                    type="number"
                    placeholder="Min Price" 
                    className="pl-7"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input 
                    type="number"
                    placeholder="Max Price" 
                    className="pl-7"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>
              </Tabs>
            </div>
          </div>
          
          {/* Intents Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-5 w-24 ml-3" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredIntents.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIntents.map(intent => (
                <Card key={intent.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{intent.title}</h3>
                      <Badge 
                        variant={intent.status === "active" ? "success" : "secondary"}
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${intent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
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
                    
                    {intent.brands && intent.brands.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Preferred brands:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {intent.brands.map((brand, index) => (
                            <Badge 
                              key={index} 
                              variant="outline"
                              className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border-blue-200"
                            >
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-5">
                      <Button 
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                        onClick={() => handleMakeOffer(intent)}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Make an Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Target className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No intents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || priceMin || priceMax
                  ? "Try adjusting your search criteria."
                  : `No ${statusFilter} intents available at the moment.`}
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Create Offer Modal */}
      {selectedIntent && (
        <CreateOfferForm 
          isOpen={!!selectedIntent} 
          onClose={() => setSelectedIntent(null)} 
          intent={selectedIntent}
        />
      )}
    </div>
  );
}
