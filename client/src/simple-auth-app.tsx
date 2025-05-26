import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Handshake, Plus, Inbox } from "lucide-react";
import { CreateIntentDialog } from '@/components/create-intent-dialog';
import { OfferInbox } from '@/components/offer-inbox';
import { Badge } from "@/components/ui/badge";

type User = {
  id: number;
  name: string;
  username: string;
  userType: 'consumer' | 'producer';
};

// Sample data for the application
const sampleIntents = [
  {
    id: 1,
    title: "Gaming Laptop",
    timeframe: "Within 2 weeks",
    budgetMin: 1200,
    budgetMax: 1800,
    features: ["16GB RAM", "RTX 3060 or better", "15-inch screen", "SSD 512GB+"],
    brands: ["ASUS", "MSI", "Lenovo Legion"],
    status: "active",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 2,
    title: "Refrigerator with Freezer",
    timeframe: "Within 1 month",
    budgetMin: 800,
    budgetMax: 1500,
    features: ["French Door", "Ice Maker", "Energy Star", "Smart Features"],
    brands: ["Samsung", "LG", "Whirlpool"],
    status: "active",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 3,
    title: "Electric Standing Desk",
    timeframe: "Within 2 months",
    budgetMin: 300,
    budgetMax: 600,
    features: ["Memory Settings", "Cable Management", "Height Range 25-50 inches"],
    brands: ["Fully", "Uplift", "Vari"],
    status: "active",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  }
];

const sampleOffers = [
  {
    id: 1,
    intentId: 1,
    company: "TechHaven Electronics",
    product: "MSI GE66 Raider",
    price: 1399.99,
    originalPrice: 1699.99,
    discount: "18% off MSRP",
    features: ["16GB RAM", "RTX 3070", "15.6-inch 240Hz", "1TB SSD"],
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
  },
  {
    id: 2,
    intentId: 1,
    company: "ComputerWorld",
    product: "ASUS ROG Strix G15",
    price: 1299.99,
    originalPrice: 1499.99,
    discount: "13% off MSRP",
    features: ["16GB RAM", "RTX 3060", "15.6-inch 300Hz", "512GB SSD"],
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // expires in 5 days
  },
  {
    id: 3,
    intentId: 2,
    company: "HomeAppliances Direct",
    product: "Samsung RF28T5001SR",
    price: 1199.99,
    originalPrice: 1499.99,
    discount: "20% off MSRP",
    features: ["French Door", "Ice Maker", "Energy Star", "Smart Hub"],
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // expires in 14 days
  }
];

const samplePurchases = [
  {
    id: 1,
    intentId: 3,
    offerId: null, // Direct purchase not from an offer
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    details: {
      store: "Office Depot",
      product: "Fully Jarvis Standing Desk",
      price: 549.99
    }
  }
];

export default function SimpleAuthApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();
  
  // Sample data state
  const [intents, setIntents] = useState(sampleIntents);
  const [offers, setOffers] = useState(sampleOffers);
  const [purchases, setPurchases] = useState(samplePurchases);
  
  // Create Intent dialog state
  const [isCreateIntentOpen, setIsCreateIntentOpen] = useState(false);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'dashboard' | 'offer-inbox' | 'intent-feed'>('dashboard');

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerUserType, setRegisterUserType] = useState<'consumer' | 'producer'>('consumer');

  // Mock login function
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!loginUsername || !loginPassword) {
      toast({
        title: "Login failed",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    // Create and set user 
    const user = {
      id: 1,
      name: "Test User",
      username: loginUsername,
      userType: 'consumer' as const,
    };
    
    setCurrentUser(user);
    setLoggedIn(true);
    
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
  };

  // Mock register function
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!registerName || !registerUsername || !registerPassword) {
      toast({
        title: "Registration failed",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Create and set user
    const user = {
      id: 1,
      name: registerName,
      username: registerUsername,
      userType: registerUserType,
    };
    
    setCurrentUser(user);
    setLoggedIn(true);
    
    toast({
      title: "Registration successful",
      description: "Your account has been created!",
    });
  };

  // Mock logout function
  const handleLogout = () => {
    setCurrentUser(null);
    setLoggedIn(false);
    setLoginUsername("");
    setLoginPassword("");
    setRegisterName("");
    setRegisterUsername("");
    setRegisterPassword("");
    setRegisterUserType('consumer');
    setActiveTab("login");
    
    toast({
      title: "Logged out successfully",
    });
  };
  
  // Create intent handler
  const handleCreateIntent = (newIntent: any) => {
    // Add user ID to the intent
    const intentWithUserId = {
      ...newIntent,
      userId: currentUser?.id || 1,
    };
    
    // Add to intents list
    setIntents([intentWithUserId, ...intents]);
  };
  
  // Offer management handlers
  const handleAcceptOffer = (offerId: number) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'accepted' }
          : offer
      )
    );
  };
  
  const handleRejectOffer = (offerId: number) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'rejected' }
          : offer
      )
    );
  };
  
  const handleMessageCompany = (offerId: number, message: string) => {
    // In a real app, this would send the message to the company
    console.log(`Message to offer ${offerId}: ${message}`);
  };

  // Feature list component
  const FeatureList = ({ features }: { features: string[] }) => (
    <ul className="space-y-2 mt-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );

  // If user is logged in, show dashboard
  if (loggedIn && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Toaster />
        {/* Create Intent Dialog */}
        <CreateIntentDialog 
          isOpen={isCreateIntentOpen}
          onClose={() => setIsCreateIntentOpen(false)}
          onCreateIntent={handleCreateIntent}
        />
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-8 border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-primary-500 flex items-center justify-center mr-3">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">IntentMarket</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          {currentUser.userType === 'consumer' && (
            <div className="px-8 pt-4">
              <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="offer-inbox">
                    <Inbox className="h-4 w-4 mr-2" />
                    Offer Inbox ({offers.filter(o => o.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="intent-feed">My Intents</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          <div className="p-8">
            {/* Content based on current view */}
            {currentUser.userType === 'consumer' ? (
              <>
                {currentView === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}!</h2>
                      <p className="text-gray-600">
                        Manage your purchase intents and discover great offers from producers.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Dashboard</CardTitle>
                <CardDescription>
                  {currentUser.userType === 'consumer' 
                    ? 'Manage your purchase intents and offers' 
                    : 'Browse consumer intents and create offers'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This is a simplified demo of the IntentMarket platform. In the full application, 
                  you would see your {currentUser.userType === 'consumer' ? 'intents and received offers' : 'available intents and your offers'} here.
                </p>
                
                {currentUser.userType === 'consumer' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Button className="w-full" onClick={() => setIsCreateIntentOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" /> Create Intent
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => setCurrentView('offer-inbox')}>
                          <Inbox className="w-4 h-4 mr-2" /> View Offers
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Your Active Intents</h3>
                      <div className="space-y-3">
                        {intents.map(intent => (
                          <div key={intent.id} className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{intent.title}</h4>
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                {intent.status}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1 text-sm text-gray-500">
                              <span>Budget: ${intent.budgetMin} - ${intent.budgetMax}</span>
                              <span>{intent.timeframe}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {intent.features.slice(0, 2).map((feature, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                              {intent.features.length > 2 && (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  +{intent.features.length - 2} more
                                </span>
                              )}
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {new Date(intent.createdAt).toLocaleDateString()}
                              </span>
                              <Button variant="outline" size="sm">View Offers</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stats Overview</CardTitle>
                <CardDescription>
                  Your activity on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Active Intents</div>
                    <div className="text-2xl font-bold">{intents.filter(i => i.status === 'active').length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">New Offers</div>
                    <div className="text-2xl font-bold">{offers.filter(o => o.status === 'pending').length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Completed Purchases</div>
                    <div className="text-2xl font-bold">{purchases.length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Potential Savings</div>
                    <div className="text-2xl font-bold">
                      ${offers.reduce((total, offer) => 
                        total + (offer.originalPrice ? offer.originalPrice - offer.price : 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                    </div>
                  </div>
                )}
                
                {currentView === 'offer-inbox' && (
                  <OfferInbox 
                    intents={intents}
                    offers={offers}
                    onAcceptOffer={handleAcceptOffer}
                    onRejectOffer={handleRejectOffer}
                    onMessageCompany={handleMessageCompany}
                  />
                )}
                
                {currentView === 'intent-feed' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">My Intents</h2>
                    <div className="space-y-4">
                      {intents.map(intent => (
                        <Card key={intent.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold">{intent.title}</h3>
                                <p className="text-sm text-gray-600">
                                  Budget: ${intent.budgetMin} - ${intent.budgetMax} • {intent.timeframe}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {intent.features.map((feature: string, i: number) => (
                                    <Badge key={i} variant="outline">{feature}</Badge>
                                  ))}
                                </div>
                              </div>
                              <Badge variant={intent.status === 'active' ? 'default' : 'secondary'}>
                                {intent.status}
                              </Badge>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Created: {new Date(intent.createdAt).toLocaleDateString()}
                              </span>
                              <div className="space-x-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentView('offer-inbox')}>
                                  View Offers ({offers.filter(o => o.intentId === intent.id).length})
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Producer dashboard (simplified for now)
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Producer Dashboard</h2>
                  <p className="text-gray-600">Browse consumer intents and create targeted offers.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Consumer Intents</CardTitle>
                      <CardDescription>Browse and respond to purchase intents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {intents.map(intent => (
                          <div key={intent.id} className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{intent.title}</h4>
                              <Badge variant="outline">{intent.status}</Badge>
                            </div>
                            <div className="flex justify-between mt-1 text-sm text-gray-500">
                              <span>Budget: ${intent.budgetMin} - ${intent.budgetMax}</span>
                              <span>{intent.timeframe}</span>
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {new Date(intent.createdAt).toLocaleDateString()}
                              </span>
                              <Button variant="default" size="sm">Create Offer</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Producer Stats</CardTitle>
                      <CardDescription>Your performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Available Intents</div>
                          <div className="text-2xl font-bold">{intents.filter(i => i.status === 'active').length}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">My Active Offers</div>
                          <div className="text-2xl font-bold">{offers.filter(o => o.status === 'pending').length}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Avg. Discount</div>
                          <div className="text-2xl font-bold">
                            {Math.round(offers.reduce((total, offer) => 
                              total + (offer.originalPrice ? (offer.originalPrice - offer.price) / offer.originalPrice * 100 : 0), 0) / 
                              offers.filter(o => o.originalPrice).length)}%
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Avg. Response Time</div>
                          <div className="text-2xl font-bold">1.5 days</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
    );
  }

  // Otherwise, show the login/register form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center p-4">
      <Toaster />
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 rounded-md bg-primary-500 flex items-center justify-center mr-3">
              <Handshake className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IntentMarket</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="Your username" 
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Your password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="remember" className="mr-2" />
                        <Label htmlFor="remember" className="text-sm text-gray-500">Remember me</Label>
                      </div>
                      <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
                        Forgot password?
                      </a>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4 py-6 text-white font-bold text-lg rounded-md shadow-md"
                    >
                      LOGIN
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button 
                      type="button"
                      className="text-primary-600 hover:text-primary-500 font-medium underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create a new account</CardTitle>
                  <CardDescription>
                    Sign up to get started with IntentMarket
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Your full name" 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        placeholder="Choose a username" 
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="Choose a password" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <Button 
                          type="button"
                          variant={registerUserType === "consumer" ? "default" : "outline"}
                          onClick={() => setRegisterUserType("consumer")}
                        >
                          Consumer
                        </Button>
                        <Button 
                          type="button"
                          variant={registerUserType === "producer" ? "default" : "outline"}
                          onClick={() => setRegisterUserType("producer")}
                        >
                          Producer
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4 py-6 text-white font-bold text-lg rounded-md shadow-md"
                    >
                      REGISTER
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <button 
                      type="button"
                      className="text-primary-600 hover:text-primary-500 font-medium underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Info Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Connect Consumers & Producers</h2>
          <p className="text-primary-100 mb-6">
            IntentMarket is the platform where consumers declare purchase intent and producers make targeted offers.
          </p>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === "login" ? "Welcome Back!" : "Why Join IntentMarket?"}
            </h3>
            
            {activeTab === "login" ? (
              <p className="text-primary-100">
                Sign in to continue your journey of connecting with the right products at the right price.
              </p>
            ) : (
              <FeatureList 
                features={[
                  "Declare purchase intent for large items",
                  "Receive targeted offers from producers",
                  "Compare prices and features easily",
                  "Save money on your major purchases",
                  "Complete the purchase journey in one place"
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}