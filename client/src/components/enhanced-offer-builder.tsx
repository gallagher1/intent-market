import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Save, 
  Send, 
  FileText, 
  TrendingUp, 
  Target, 
  Clock, 
  Shield, 
  Truck, 
  Star,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Zap
} from "lucide-react";

interface Intent {
  id: number;
  title: string;
  budgetMin: number;
  budgetMax: number;
  timeframe: string;
  features: string[];
  description?: string;
  preferredBrand?: string;
  category?: string;
}

interface EnhancedOfferBuilderProps {
  intent: Intent;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: any) => void;
}

export function EnhancedOfferBuilder({ intent, isOpen, onClose, onSubmit }: EnhancedOfferBuilderProps) {
  const [activeTab, setActiveTab] = useState("basics");
  const [offerData, setOfferData] = useState({
    // Basic Information
    productName: "",
    price: "",
    originalPrice: "",
    description: "",
    
    // Features & Specifications
    features: [] as string[],
    specifications: "",
    compatibility: "",
    
    // Pricing & Value
    discountPercentage: 0,
    valueProposition: "",
    priceJustification: "",
    competitiveAdvantage: "",
    
    // Delivery & Support
    deliveryTime: "",
    shippingCost: "",
    installationIncluded: false,
    warranty: "",
    supportLevel: "",
    returnPolicy: "",
    
    // Terms & Conditions
    validUntil: "",
    paymentTerms: "",
    minimumOrder: "",
    bulkDiscounts: false,
    
    // Marketing & Presentation
    highlights: [] as string[],
    customerTestimonials: "",
    certifications: [] as string[],
    images: [] as string[],
    
    // Strategy
    offerTemplate: "",
    urgencyLevel: "standard"
  });

  const [completionScore, setCompletionScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Calculate completion score
  const calculateCompletionScore = () => {
    const requiredFields = [
      offerData.productName,
      offerData.price,
      offerData.description,
      offerData.deliveryTime,
      offerData.warranty
    ];
    
    const optionalFields = [
      offerData.originalPrice,
      offerData.specifications,
      offerData.valueProposition,
      offerData.competitiveAdvantage,
      offerData.supportLevel
    ];
    
    const requiredScore = (requiredFields.filter(field => field).length / requiredFields.length) * 60;
    const optionalScore = (optionalFields.filter(field => field).length / optionalFields.length) * 40;
    
    return Math.round(requiredScore + optionalScore);
  };

  // Generate smart suggestions
  const generateSuggestions = () => {
    const newSuggestions = [];
    
    if (!offerData.originalPrice && offerData.price) {
      newSuggestions.push("Consider adding an original price to show savings");
    }
    
    if (intent.budgetMax && parseFloat(offerData.price) > intent.budgetMax) {
      newSuggestions.push("Your price exceeds the customer's maximum budget");
    }
    
    if (intent.timeframe.includes("ASAP") && !offerData.deliveryTime.includes("same day")) {
      newSuggestions.push("Customer needs this ASAP - consider expedited delivery");
    }
    
    if (offerData.features.length < 3) {
      newSuggestions.push("Add more product features to highlight value");
    }
    
    if (!offerData.competitiveAdvantage) {
      newSuggestions.push("Explain what makes your offer unique");
    }
    
    setSuggestions(newSuggestions);
  };

  // Offer templates
  const offerTemplates = {
    premium: {
      name: "Premium Quality",
      description: "High-end product with superior features",
      template: {
        valueProposition: "Premium quality with industry-leading performance and reliability",
        competitiveAdvantage: "Superior build quality and advanced features",
        warranty: "Extended warranty included",
        supportLevel: "Priority customer support"
      }
    },
    budget: {
      name: "Best Value",
      description: "Cost-effective solution without compromising quality",
      template: {
        valueProposition: "Exceptional value for money with all essential features",
        competitiveAdvantage: "Unbeatable price-to-performance ratio",
        warranty: "Standard warranty",
        supportLevel: "Standard support"
      }
    },
    urgent: {
      name: "Quick Delivery",
      description: "Fast delivery for urgent requirements",
      template: {
        valueProposition: "Immediate availability with express delivery",
        competitiveAdvantage: "Fastest delivery time in the market",
        deliveryTime: "Same day or next day delivery",
        supportLevel: "Express setup support"
      }
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = offerTemplates[templateKey as keyof typeof offerTemplates];
    if (template) {
      setOfferData(prev => ({
        ...prev,
        ...template.template,
        offerTemplate: templateKey
      }));
    }
  };

  const updateOfferData = (field: string, value: any) => {
    setOfferData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate discount percentage
      if (field === "price" || field === "originalPrice") {
        const price = parseFloat(field === "price" ? value : updated.price);
        const originalPrice = parseFloat(field === "originalPrice" ? value : updated.originalPrice);
        if (price && originalPrice && originalPrice > price) {
          updated.discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
        }
      }
      
      return updated;
    });
    
    // Update completion score and suggestions
    setTimeout(() => {
      setCompletionScore(calculateCompletionScore());
      generateSuggestions();
    }, 100);
  };

  const addFeature = (feature: string) => {
    if (feature && !offerData.features.includes(feature)) {
      updateOfferData("features", [...offerData.features, feature]);
    }
  };

  const removeFeature = (index: number) => {
    updateOfferData("features", offerData.features.filter((_, i) => i !== index));
  };

  const addHighlight = (highlight: string) => {
    if (highlight && !offerData.highlights.includes(highlight)) {
      updateOfferData("highlights", [...offerData.highlights, highlight]);
    }
  };

  const handleSubmit = () => {
    onSubmit(offerData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Enhanced Offer Builder: {intent.title}
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive offer with advanced features and smart suggestions
          </DialogDescription>
        </DialogHeader>
        
        {/* Completion Score & Quick Actions */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <Label className="text-sm font-medium">Completion Score</Label>
              <div className="flex items-center space-x-2">
                <Progress value={completionScore} className="w-24" />
                <span className="text-sm font-semibold">{completionScore}%</span>
              </div>
            </div>
            
            {suggestions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">{suggestions.length} suggestions</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={completionScore < 60}
              size="sm"
            >
              <Send className="w-4 h-4 mr-1" />
              Submit Offer
            </Button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Quick Start Templates</Label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(offerTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant={offerData.offerTemplate === key ? "default" : "outline"}
                size="sm"
                onClick={() => applyTemplate(key)}
                className="flex flex-col h-auto p-3"
              >
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-gray-600">{template.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Suggestions Panel */}
        {suggestions.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="presentation">Presentation</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product/Service Name *</Label>
                <Input
                  id="productName"
                  placeholder="Enter your product name"
                  value={offerData.productName}
                  onChange={(e) => updateOfferData("productName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select value={offerData.urgencyLevel} onValueChange={(value) => updateOfferData("urgencyLevel", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your product in detail..."
                rows={4}
                value={offerData.description}
                onChange={(e) => updateOfferData("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="specifications">Technical Specifications</Label>
              <Textarea
                id="specifications"
                placeholder="List technical specifications, dimensions, compatibility..."
                rows={3}
                value={offerData.specifications}
                onChange={(e) => updateOfferData("specifications", e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <div>
              <Label>Product Features</Label>
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
                  Add
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

            <div>
              <Label htmlFor="compatibility">Compatibility & Requirements</Label>
              <Textarea
                id="compatibility"
                placeholder="System requirements, compatibility information..."
                rows={3}
                value={offerData.compatibility}
                onChange={(e) => updateOfferData("compatibility", e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Your Price * <DollarSign className="w-4 h-4 inline" /></Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={offerData.price}
                  onChange={(e) => updateOfferData("price", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="0.00"
                  value={offerData.originalPrice}
                  onChange={(e) => updateOfferData("originalPrice", e.target.value)}
                />
              </div>
              <div>
                <Label>Discount</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {offerData.discountPercentage}% OFF
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="valueProposition">Value Proposition</Label>
              <Textarea
                id="valueProposition"
                placeholder="Explain why your offer provides great value..."
                rows={3}
                value={offerData.valueProposition}
                onChange={(e) => updateOfferData("valueProposition", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="competitiveAdvantage">Competitive Advantage</Label>
              <Textarea
                id="competitiveAdvantage"
                placeholder="What makes your offer better than competitors..."
                rows={3}
                value={offerData.competitiveAdvantage}
                onChange={(e) => updateOfferData("competitiveAdvantage", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  placeholder="e.g., Net 30, COD, Credit Card"
                  value={offerData.paymentTerms}
                  onChange={(e) => updateOfferData("paymentTerms", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={offerData.bulkDiscounts}
                  onCheckedChange={(checked) => updateOfferData("bulkDiscounts", checked)}
                />
                <Label>Bulk Discounts Available</Label>
              </div>
            </div>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryTime">Delivery Time * <Truck className="w-4 h-4 inline" /></Label>
                <Input
                  id="deliveryTime"
                  placeholder="e.g., 2-3 business days"
                  value={offerData.deliveryTime}
                  onChange={(e) => updateOfferData("deliveryTime", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shippingCost">Shipping Cost</Label>
                <Input
                  id="shippingCost"
                  placeholder="e.g., Free, $29.99"
                  value={offerData.shippingCost}
                  onChange={(e) => updateOfferData("shippingCost", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={offerData.installationIncluded}
                onCheckedChange={(checked) => updateOfferData("installationIncluded", checked)}
              />
              <Label>Installation/Setup Included</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warranty">Warranty * <Shield className="w-4 h-4 inline" /></Label>
                <Input
                  id="warranty"
                  placeholder="e.g., 2 years manufacturer warranty"
                  value={offerData.warranty}
                  onChange={(e) => updateOfferData("warranty", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Input
                  id="returnPolicy"
                  placeholder="e.g., 30-day money back guarantee"
                  value={offerData.returnPolicy}
                  onChange={(e) => updateOfferData("returnPolicy", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supportLevel">Support Level</Label>
              <Select value={offerData.supportLevel} onValueChange={(value) => updateOfferData("supportLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select support level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Support</SelectItem>
                  <SelectItem value="standard">Standard Support</SelectItem>
                  <SelectItem value="premium">Premium Support</SelectItem>
                  <SelectItem value="white-glove">White Glove Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Presentation Tab */}
          <TabsContent value="presentation" className="space-y-4">
            <div>
              <Label>Key Highlights</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="Add a highlight..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addHighlight((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a highlight..."]') as HTMLInputElement;
                    addHighlight(input.value);
                    input.value = '';
                  }}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {offerData.highlights.map((highlight, index) => (
                  <Badge key={index} variant="default" className="cursor-pointer">
                    <Star className="w-3 h-3 mr-1" />
                    {highlight}
                    <button
                      onClick={() => updateOfferData("highlights", offerData.highlights.filter((_, i) => i !== index))}
                      className="ml-2 text-xs hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="customerTestimonials">Customer Testimonials</Label>
              <Textarea
                id="customerTestimonials"
                placeholder="Add customer reviews or testimonials..."
                rows={3}
                value={offerData.customerTestimonials}
                onChange={(e) => updateOfferData("customerTestimonials", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validUntil">Offer Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={offerData.validUntil}
                  onChange={(e) => updateOfferData("validUntil", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-center">
                {offerData.urgencyLevel === "urgent" && (
                  <Badge variant="destructive" className="flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Urgent Offer
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}