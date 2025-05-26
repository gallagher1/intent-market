import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedOfferBuilder } from "./enhanced-offer-builder";
import { Search, Filter, Clock, DollarSign, Eye, Plus, Zap } from "lucide-react";

interface Intent {
  id: number;
  title: string;
  budgetMin: number;
  budgetMax: number;
  timeframe: string;
  status: string;
  features: string[];
  createdAt: string;
  userId: number;
  description?: string;
  preferredBrand?: string;
  category?: string;
}

interface IntentExplorerProps {
  intents: Intent[];
  onCreateOffer: (intentId: number, offerData: any) => void;
}

export function IntentExplorer({ intents, onCreateOffer }: IntentExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  // Filter and sort intents
  const filteredIntents = intents
    .filter(intent => {
      const matchesSearch = intent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           intent.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || 
                             intent.category === categoryFilter ||
                             intent.title.toLowerCase().includes(categoryFilter.toLowerCase());
      
      const matchesBudget = budgetFilter === "all" || 
                           (budgetFilter === "under-500" && intent.budgetMax < 500) ||
                           (budgetFilter === "500-1000" && intent.budgetMin >= 500 && intent.budgetMax <= 1000) ||
                           (budgetFilter === "1000-2000" && intent.budgetMin >= 1000 && intent.budgetMax <= 2000) ||
                           (budgetFilter === "over-2000" && intent.budgetMin > 2000);
      
      const matchesTimeframe = timeframeFilter === "all" || intent.timeframe.includes(timeframeFilter);
      
      return matchesSearch && matchesCategory && matchesBudget && matchesTimeframe && intent.status === 'active';
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "budget-high":
          return b.budgetMax - a.budgetMax;
        case "budget-low":
          return a.budgetMin - b.budgetMin;
        default:
          return 0;
      }
    });



  const getUrgencyBadge = (timeframe: string) => {
    if (timeframe.includes("ASAP") || timeframe.includes("immediately")) {
      return <Badge variant="destructive" className="ml-2"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>;
    }
    if (timeframe.includes("week")) {
      return <Badge variant="secondary" className="ml-2"><Clock className="w-3 h-3 mr-1" />This Week</Badge>;
    }
    if (timeframe.includes("month")) {
      return <Badge variant="outline" className="ml-2"><Clock className="w-3 h-3 mr-1" />This Month</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Intent Explorer</h2>
          <p className="text-gray-600">Discover purchase opportunities and create targeted offers</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Active Intents</div>
          <div className="text-2xl font-bold">{filteredIntents.length}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Intents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by product, features, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-48">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="appliances">Appliances</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Budget Range</Label>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Budgets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                  <SelectItem value="over-2000">Over $2,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label>Timeframe</Label>
              <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Timeframes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timeframes</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="ASAP">ASAP/Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="budget-high">Highest Budget</SelectItem>
                  <SelectItem value="budget-low">Lowest Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intent List */}
      <div className="space-y-4">
        {filteredIntents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matching intents found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredIntents.map(intent => (
            <Card key={intent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold">{intent.title}</h3>
                      {getUrgencyBadge(intent.timeframe)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${intent.budgetMin.toLocaleString()} - ${intent.budgetMax.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {intent.timeframe}
                      </div>
                    </div>
                    
                    {intent.description && (
                      <p className="text-gray-700 mb-3 text-sm">{intent.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {intent.features.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Posted: {new Date(intent.createdAt).toLocaleDateString()}
                      {intent.preferredBrand && (
                        <span className="ml-4">
                          Preferred Brand: <span className="font-medium">{intent.preferredBrand}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{intent.title}</DialogTitle>
                          <DialogDescription>
                            Complete purchase intent details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Budget Range</Label>
                              <p className="text-lg font-semibold">
                                ${intent.budgetMin.toLocaleString()} - ${intent.budgetMax.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Timeframe</Label>
                              <p className="text-lg">{intent.timeframe}</p>
                            </div>
                          </div>
                          
                          {intent.description && (
                            <div>
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-gray-700">{intent.description}</p>
                            </div>
                          )}
                          
                          <div>
                            <Label className="text-sm font-medium">Required Features</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {intent.features.map((feature, i) => (
                                <Badge key={i} variant="secondary">{feature}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          {intent.preferredBrand && (
                            <div>
                              <Label className="text-sm font-medium">Preferred Brand</Label>
                              <p className="text-gray-700">{intent.preferredBrand}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      onClick={() => {
                        setSelectedIntent(intent);
                        setIsOfferDialogOpen(true);
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Offer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Enhanced Offer Builder */}
      {selectedIntent && (
        <EnhancedOfferBuilder
          intent={selectedIntent}
          isOpen={isOfferDialogOpen}
          onClose={() => setIsOfferDialogOpen(false)}
          onSubmit={(offerData) => {
            onCreateOffer(selectedIntent.id, offerData);
            setIsOfferDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}