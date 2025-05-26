import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Plus,
  Save,
  Send,
  Lightbulb,
  AlertCircle
} from "lucide-react";

interface Intent {
  id: number;
  title: string;
  budgetMin: number;
  budgetMax: number;
  timeframe: string;
  features: string[];
  category?: string;
  region?: string;
  zipcode?: string;
  status: string;
}

interface OfferBuilderProps {
  intents: Intent[];
  onCreateOffer: (offerData: any) => void;
}

export function OfferBuilder({ intents, onCreateOffer }: OfferBuilderProps) {
  const [activeTab, setActiveTab] = useState("market-research");
  
  // Market Research Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  
  // Offer Creation Data
  const [offerData, setOfferData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    targetRegions: [] as string[],
    targetBudgetRange: { min: "", max: "" },
    features: [] as string[],
    timeframe: "",
    deliveryOptions: "",
    warranty: "",
    specialTerms: "",
    validUntil: "",
    maxQuantity: "",
    bulkPricing: false
  });

  // Filter intents based on current filters
  const filteredIntents = intents.filter(intent => {
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
    
    const matchesRegion = regionFilter === "all" || intent.region === regionFilter;
    const matchesTimeframe = timeframeFilter === "all" || intent.timeframe.includes(timeframeFilter);
    
    return matchesSearch && matchesCategory && matchesBudget && matchesRegion && matchesTimeframe && intent.status === 'active';
  });

  // Market insights based on filtered data
  const getMarketInsights = () => {
    const totalIntents = filteredIntents.length;
    const avgBudget = filteredIntents.reduce((sum, intent) => sum + ((intent.budgetMin + intent.budgetMax) / 2), 0) / totalIntents || 0;
    const urgentIntents = filteredIntents.filter(intent => intent.timeframe.includes("ASAP") || intent.timeframe.includes("week")).length;
    const topFeatures = filteredIntents.flatMap(intent => intent.features)
      .reduce((acc, feature) => {
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      totalIntents,
      avgBudget,
      urgentIntents,
      urgencyRate: totalIntents > 0 ? (urgentIntents / totalIntents) * 100 : 0,
      topFeatures: Object.entries(topFeatures).sort((a, b) => b[1] - a[1]).slice(0, 5)
    };
  };

  const insights = getMarketInsights();

  const handleCreateOffer = () => {
    const offer = {
      ...offerData,
      price: parseFloat(offerData.price),
      originalPrice: offerData.originalPrice ? parseFloat(offerData.originalPrice) : undefined,
      targetBudgetRange: {
        min: parseFloat(offerData.targetBudgetRange.min),
        max: parseFloat(offerData.targetBudgetRange.max)
      },
      marketInsights: insights,
      createdAt: new Date().toISOString()
    };
    
    onCreateOffer(offer);
  };

  const addFeature = (feature: string) => {
    if (feature && !offerData.features.includes(feature)) {
      setOfferData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const removeFeature = (index: number) => {
    setOfferData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Offer Builder</h2>
          <p className="text-gray-600">Research market demand and create strategic offers</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market-research">Market Research</TabsTrigger>
          <TabsTrigger value="offer-creation">Create Offer</TabsTrigger>
          <TabsTrigger value="offer-preview">Preview & Publish</TabsTrigger>
        </TabsList>

        {/* Market Research Tab */}
        <TabsContent value="market-research" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Market Filters
              </CardTitle>
              <CardDescription>
                Filter consumer intents to understand market demand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Search Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products, features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
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
                
                <div>
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
                
                <div>
                  <Label>Region</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="northeast">Northeast</SelectItem>
                      <SelectItem value="southeast">Southeast</SelectItem>
                      <SelectItem value="midwest">Midwest</SelectItem>
                      <SelectItem value="southwest">Southwest</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
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
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Intents</p>
                    <p className="text-2xl font-bold">{insights.totalIntents}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Budget</p>
                    <p className="text-2xl font-bold">${Math.round(insights.avgBudget).toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Urgent Requests</p>
                    <p className="text-2xl font-bold">{insights.urgentIntents}</p>
                  </div>
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Urgency Rate</p>
                    <p className="text-2xl font-bold">{Math.round(insights.urgencyRate)}%</p>
                  </div>
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Features */}
          {insights.topFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Most Requested Features
                </CardTitle>
                <CardDescription>
                  Popular features based on current filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.topFeatures.map(([feature, count]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / insights.totalIntents) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Opportunity Alert */}
          {insights.totalIntents > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Market Opportunity Detected</h3>
                    <p className="text-blue-800 text-sm mt-1">
                      {insights.totalIntents} active intents match your filters with an average budget of ${Math.round(insights.avgBudget).toLocaleString()}. 
                      {insights.urgencyRate > 30 && ` ${Math.round(insights.urgencyRate)}% are urgent requests - consider fast delivery options.`}
                    </p>
                    <Button 
                      onClick={() => setActiveTab("offer-creation")}
                      className="mt-3"
                      size="sm"
                    >
                      Create Targeted Offer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Offer Creation Tab */}
        <TabsContent value="offer-creation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Offer</CardTitle>
              <CardDescription>
                Use market insights to create a compelling offer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Offer Title *</Label>
                  <Input
                    id="title"
                    placeholder="Professional Gaming Laptop Deal"
                    value={offerData.title}
                    onChange={(e) => setOfferData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={offerData.category} onValueChange={(value) => setOfferData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="appliances">Appliances</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Offer Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your offer, what makes it special, and why customers should choose you..."
                  rows={4}
                  value={offerData.description}
                  onChange={(e) => setOfferData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Your Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1299"
                    value={offerData.price}
                    onChange={(e) => setOfferData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="1499"
                    value={offerData.originalPrice}
                    onChange={(e) => setOfferData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Key Features</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Add a feature..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFeature((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a feature..."]') as HTMLInputElement;
                      addFeature(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {offerData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {feature}
                      <button
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-xs hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryOptions">Delivery Options</Label>
                  <Input
                    id="deliveryOptions"
                    placeholder="2-3 business days, Free shipping"
                    value={offerData.deliveryOptions}
                    onChange={(e) => setOfferData(prev => ({ ...prev, deliveryOptions: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    placeholder="2 years manufacturer warranty"
                    value={offerData.warranty}
                    onChange={(e) => setOfferData(prev => ({ ...prev, warranty: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={offerData.bulkPricing}
                  onCheckedChange={(checked) => setOfferData(prev => ({ ...prev, bulkPricing: checked }))}
                />
                <Label>Offer bulk pricing discounts</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="offer-preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Offer Preview</CardTitle>
              <CardDescription>
                Review your offer before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">{offerData.title || "Your Offer Title"}</h3>
                <p className="text-gray-700 mb-3">{offerData.description || "Your offer description will appear here..."}</p>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="text-2xl font-bold text-green-600">
                    ${offerData.price || "0"}
                  </div>
                  {offerData.originalPrice && (
                    <div className="text-lg text-gray-500 line-through">
                      ${offerData.originalPrice}
                    </div>
                  )}
                </div>
                
                {offerData.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {offerData.features.map((feature, index) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 space-y-1">
                  {offerData.deliveryOptions && <p>📦 {offerData.deliveryOptions}</p>}
                  {offerData.warranty && <p>🛡️ {offerData.warranty}</p>}
                  {offerData.bulkPricing && <p>📊 Bulk pricing available</p>}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={handleCreateOffer}
                  disabled={!offerData.title || !offerData.description || !offerData.price}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Offer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}