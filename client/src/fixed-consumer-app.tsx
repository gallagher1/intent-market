import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Handshake, Plus, Inbox, Target } from "lucide-react";
import { CreateIntentDialog } from '@/components/create-intent-dialog';
import { OfferInbox } from '@/components/offer-inbox';
import { CreateOfferForm } from '@/components/offer/create-offer-form';
import { MainNavigation } from '@/components/main-navigation';
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type User = {
  id: number;
  name: string;
  username: string;
  userType: 'consumer' | 'company';
};

type Intent = {
  id: number;
  title: string;
  budgetMin: number;
  budgetMax: number;
  timeframe: string;
  status: string;
  features: string[];
  createdAt: string;
  userId: number;
};

type Offer = {
  id: number;
  intentId: number;
  producerId: number;
  companyName: string;
  price: number;
  originalPrice?: number;
  description: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

type Purchase = {
  id: number;
  userId: number;
  intentId: number;
  offerId: number;
  amount: number;
  createdAt: string;
};

export default function FixedConsumerApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCreateIntentOpen, setIsCreateIntentOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is logged in on mount
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        return await res.json();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

  // Fetch user's intents
  const { data: intents = [], isLoading: intentsLoading } = useQuery({
    queryKey: ["/api/user/intents"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/intents");
      return await res.json();
    },
    enabled: !!user
  });

  // Fetch user's received offers (for consumers)
  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["/api/user/received-offers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/received-offers");
      return await res.json();
    },
    enabled: !!user && user.userType === 'consumer'
  });

  // Fetch user's created offers (for companies)
  const { data: myOffers = [], isLoading: myOffersLoading } = useQuery({
    queryKey: ["/api/user/offers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/offers");
      return await res.json();
    },
    enabled: !!user && user.userType === 'company'
  });

  // Fetch user's purchases
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["/api/user/purchases"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/purchases");
      return await res.json();
    },
    enabled: !!user
  });

  // Fetch user stats for dashboard
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/stats");
      return await res.json();
    },
    enabled: !!user
  });

  // Fetch all intents for companies (market research)
  const { data: allIntents = [] } = useQuery({
    queryKey: ["/api/intents"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/intents");
      return await res.json();
    },
    enabled: !!user && user.userType === 'company'
  });

  // Update logged in state when user data changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setLoggedIn(true);
    } else if (!userLoading) {
      setCurrentUser(null);
      setLoggedIn(false);
    }
  }, [user, userLoading]);

  // Register mutation (for demo)
  const registerMutation = useMutation({
    mutationFn: async ({ username, userType }: { username: string, userType: 'consumer' | 'producer' }) => {
      const res = await apiRequest("POST", "/api/register", { 
        username, 
        password: "demo", 
        name: username,
        userType 
      });
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Account created successfully!", description: `Welcome to IntentMarket, ${userData.name}!` });
    },
    onError: () => {
      toast({ title: "Registration failed", description: "Username might already exist. Try a different name.", variant: "destructive" });
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, userType }: { username: string, userType: 'consumer' | 'producer' }) => {
      const res = await apiRequest("POST", "/api/login", { username, password: "demo" });
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Login successful", description: `Welcome back, ${userData.name || userData.username}!` });
    },
    onError: (error, variables) => {
      toast({ title: "Login failed", description: "Account not found. Creating new account...", variant: "destructive" });
      // Auto-register if login fails
      setTimeout(() => {
        registerMutation.mutate({ username: variables.username, userType: variables.userType });
      }, 1000);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setCurrentUser(null);
      setLoggedIn(false);
      setCurrentView('dashboard');
      toast({ title: "Logged out", description: "See you next time!" });
    }
  });

  // Create intent mutation
  const createIntentMutation = useMutation({
    mutationFn: async (intentData: any) => {
      const res = await apiRequest("POST", "/api/intents", intentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/intents"] });
      setIsCreateIntentOpen(false);
      toast({ title: "Intent created", description: "Your purchase intent has been posted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create intent. Please try again.", variant: "destructive" });
    }
  });

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      const res = await apiRequest("PATCH", `/api/offers/${offerId}/accept`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/received-offers"] });
      toast({ title: "Offer accepted", description: "You can now proceed with the purchase!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to accept offer.", variant: "destructive" });
    }
  });

  // Decline offer mutation
  const declineOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      const res = await apiRequest("PATCH", `/api/offers/${offerId}/decline`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/received-offers"] });
      toast({ title: "Offer declined", description: "The company has been notified." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to decline offer.", variant: "destructive" });
    }
  });

  // Message company mutation
  const messageCompanyMutation = useMutation({
    mutationFn: async ({ offerId, message }: { offerId: number, message: string }) => {
      const res = await apiRequest("POST", `/api/offers/${offerId}/message`, { message });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent", description: "Your message has been sent to the company." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  });

  // Create offer mutation (for producers)
  const createOfferMutation = useMutation({
    mutationFn: async (offerData: any) => {
      const res = await apiRequest("POST", "/api/offers", offerData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/offers"] });
      toast({ title: "Offer created", description: "Your offer has been submitted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create offer.", variant: "destructive" });
    }
  });

  // Handler functions
  const handleLogin = (username: string, userType: 'consumer' | 'producer') => {
    loginMutation.mutate({ username, userType });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateIntent = (intentData: any) => {
    createIntentMutation.mutate(intentData);
  };

  const handleAcceptOffer = (offerId: number) => {
    acceptOfferMutation.mutate(offerId);
  };

  const handleRejectOffer = (offerId: number) => {
    declineOfferMutation.mutate(offerId);
  };

  const handleMessageCompany = (offerId: number, message: string) => {
    messageCompanyMutation.mutate({ offerId, message });
  };

  const handleCreateOffer = (offerData: any) => {
    createOfferMutation.mutate(offerData);
  };

  // Get breadcrumb items based on current view
  const getBreadcrumbItems = () => {
    switch (currentView) {
      case 'offer-inbox':
        return [{ label: 'Offer Inbox' }];
      case 'intent-feed':
        return [{ label: 'My Intents' }];
      case 'create-intent':
        return [{ label: 'Create Intent' }];
      case 'offer-builder':
        return [{ label: 'Offer Builder' }];
      case 'my-offers':
        return [{ label: 'My Offers' }];
      case 'analytics':
        return [{ label: 'Analytics' }];
      case 'settings':
        return [{ label: 'Settings' }];
      case 'notifications':
        return [{ label: 'Notifications' }];
      default:
        return [];
    }
  };

  // Handle navigation including special actions
  const handleNavigation = (view: string) => {
    if (view === 'create-intent') {
      setIsCreateIntentOpen(true);
      return;
    }
    setCurrentView(view);
  };

  // If user is logged in, show dashboard
  if (loggedIn && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        <CreateIntentDialog 
          isOpen={isCreateIntentOpen}
          onClose={() => setIsCreateIntentOpen(false)}
          onCreateIntent={handleCreateIntent}
        />
        
        {/* Main Navigation */}
        <MainNavigation
          userType={currentUser.userType === 'producer' ? 'company' : currentUser.userType}
          currentView={currentView}
          onViewChange={handleNavigation}
          onLogout={handleLogout}
          userName={currentUser.name}
          notifications={{
            offers: Array.isArray(offers) ? offers.filter(o => o.status === 'pending').length : 0,
            messages: 0,
            alerts: 0
          }}
        />
        
        {/* Main Content Area */}
        <div className="lg:pl-64">
          <div className="p-4 lg:p-8">
            {/* Breadcrumb Navigation */}
            {currentView !== 'dashboard' && (
              <BreadcrumbNavigation
                items={getBreadcrumbItems()}
                currentView={currentView}
                onNavigate={handleNavigation}
              />
            )}
            
            {/* Content */}
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
                            Quick actions and recent activity
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">Quick Actions</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <Button className="w-full" onClick={() => setIsCreateIntentOpen(true)}>
                                  <Plus className="w-4 h-4 mr-2" /> Create Intent
                                </Button>
                                <Button className="w-full" variant="outline" onClick={() => setCurrentView('offer-inbox')}>
                                  <Inbox className="w-4 h-4 mr-2" /> Offer Inbox
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">Recent Intents</h3>
                              <div className="space-y-3">
                                {intents.slice(0, 3).map(intent => (
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
                                    <div className="mt-2 flex justify-between items-center">
                                      <span className="text-xs text-gray-500">
                                        {new Date(intent.createdAt).toLocaleDateString()}
                                      </span>
                                      <Button variant="outline" size="sm" onClick={() => setCurrentView('offer-inbox')}>Offer Inbox</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
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
                              <div className="text-2xl font-bold">{Array.isArray(intents) ? intents.filter(i => i.status === 'active').length : 0}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">New Offers</div>
                              <div className="text-2xl font-bold">{Array.isArray(offers) ? offers.filter(o => o.status === 'pending').length : 0}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Completed Purchases</div>
                              <div className="text-2xl font-bold">{Array.isArray(purchases) ? purchases.length : 0}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Potential Savings</div>
                              <div className="text-2xl font-bold">
                                ${Array.isArray(offers) ? offers.reduce((total, offer) => 
                                  total + (offer.originalPrice ? offer.originalPrice - offer.price : 0), 0).toFixed(2) : '0.00'}
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

                {/* Placeholder views for new navigation items */}
                {currentView === 'purchase-history' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Purchase History</h2>
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                        <p className="text-gray-600">Your completed purchases will appear here</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-gray-500">
                          <p>No new notifications</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === 'settings' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">Receive updates about new offers and messages</p>
                        </div>
                        <div>
                          <Label>Privacy Settings</Label>
                          <p className="text-sm text-gray-600">Control who can see your purchase intents</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              // Producer views
              <>
                {currentView === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-2">Company Dashboard</h2>
                      <p className="text-gray-600">Discover opportunities and manage your offers</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Available Intents</p>
                              <p className="text-2xl font-bold">{Array.isArray(intents) ? intents.filter(i => i.status === 'active').length : 0}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Active Offers</p>
                              <p className="text-2xl font-bold">{Array.isArray(offers) ? offers.filter(o => o.status === 'pending').length : 0}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Inbox className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Success Rate</p>
                              <p className="text-2xl font-bold">75%</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {currentView === 'offer-builder' && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-2">Market Research & Offer Builder</h2>
                      <p className="text-gray-600">Research market demand and create strategic offers</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Market Research Panel */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Market Intelligence</CardTitle>
                          <CardDescription>
                            Analyze consumer demand patterns to inform your offer strategy
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Active Intents</span>
                                <span className="text-lg font-bold text-blue-600">{allIntents.length}</span>
                              </div>
                            </div>
                            
                            {allIntents.length > 0 && (
                              <>
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">Popular Categories:</h4>
                                  {Array.from(new Set(allIntents.map((intent: any) => intent.title?.split(' ')[0]))).slice(0, 3).map((category: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span>{category}</span>
                                      <span className="text-gray-500">
                                        {allIntents.filter((intent: any) => intent.title?.startsWith(category)).length} intents
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">Budget Ranges:</h4>
                                  {allIntents.slice(0, 3).map((intent: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span className="truncate">{intent.title}</span>
                                      <span className="text-gray-500">
                                        ${intent.budgetMin}-${intent.budgetMax}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Offer Creation Panel */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Create Strategic Offer</CardTitle>
                          <CardDescription>
                            Build offers based on market research and demand patterns
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-center py-8">
                              <Target className="h-12 w-12 mx-auto mb-4 text-primary-500" />
                              <Button 
                                onClick={() => setIsOfferDialogOpen(true)}
                                className="w-full"
                                size="lg"
                              >
                                <Plus className="h-5 w-5 mr-2" />
                                Create New Offer
                              </Button>
                              <p className="text-sm text-gray-500 mt-2">
                                Use market insights to create targeted offers
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Market Research Table */}
                    {allIntents.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Detailed Market Analysis</CardTitle>
                          <CardDescription>
                            Browse all consumer intents to understand market demand
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {allIntents.map((intent: any) => (
                              <div key={intent.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{intent.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Budget: ${intent.budgetMin?.toLocaleString()} - ${intent.budgetMax?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Timeframe: {intent.timeframe}</p>
                                    {intent.features && intent.features.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {intent.features.map((feature: string, idx: number) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {feature}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Market Data
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {currentView === 'my-offers' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">My Offers</h2>
                    <div className="space-y-4">
                      {myOffers && myOffers.length > 0 ? (
                        myOffers.map((offer: any) => (
                          <Card key={offer.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">{offer.company}</h3>
                                  <p className="text-sm text-gray-600">{offer.product}</p>
                                  <p className="text-sm text-gray-600">Price: ${offer.price}</p>
                                  {offer.originalPrice && (
                                    <p className="text-sm text-gray-500">
                                      Original: ${offer.originalPrice}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    Created: {new Date(offer.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant={offer.status === 'pending' ? 'default' : 'secondary'}>
                                  {offer.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <div className="text-gray-500">
                              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>No offers created yet</p>
                              <p className="text-sm">Create your first strategic offer using market research</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {currentView === 'analytics' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Analytics</h2>
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-gray-500">
                          <p>Analytics dashboard coming soon</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-gray-500">
                          <p>No new notifications</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === 'settings' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <Card>
                      <CardHeader>
                        <CardTitle>Producer Settings</CardTitle>
                        <CardDescription>Manage your producer profile and preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Company Information</Label>
                          <p className="text-sm text-gray-600">Update your company details and contact information</p>
                        </div>
                        <div>
                          <Label>Offer Preferences</Label>
                          <p className="text-sm text-gray-600">Set default terms and pricing strategies</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Create Strategic Offer Dialog for Producers */}
        <Dialog open={isOfferDialogOpen} onOpenChange={() => setIsOfferDialogOpen(false)}>
          <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">
                Create Strategic Offer
              </DialogTitle>
              <CardDescription>
                Build an offer based on market research and demand patterns
              </CardDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input 
                  id="company"
                  placeholder="Your company name" 
                />
              </div>
              
              <div>
                <Label htmlFor="product">Product/Service</Label>
                <Textarea 
                  id="product"
                  placeholder="Describe your product or service offering"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price"
                    type="number"
                    placeholder="1299"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price ($)</Label>
                  <Input 
                    id="originalPrice"
                    type="number"
                    placeholder="1499"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Target Category</Label>
                <Input 
                  id="category"
                  placeholder="e.g. Electronics, Appliances, Furniture"
                />
              </div>
              
              <div>
                <Label htmlFor="region">Target Region</Label>
                <Input 
                  id="region"
                  placeholder="e.g. Northeast, California, Nationwide"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setIsOfferDialogOpen(false)}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    // Get form values
                    const company = (document.getElementById('company') as HTMLInputElement)?.value;
                    const product = (document.getElementById('product') as HTMLTextAreaElement)?.value;
                    const price = parseFloat((document.getElementById('price') as HTMLInputElement)?.value);
                    const originalPrice = (document.getElementById('originalPrice') as HTMLInputElement)?.value;
                    const category = (document.getElementById('category') as HTMLInputElement)?.value;
                    const region = (document.getElementById('region') as HTMLInputElement)?.value;
                    
                    // Validate required fields
                    if (!company || !product || !price) {
                      toast({
                        title: "Missing Information",
                        description: "Please fill in company name, product description, and price.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    const offerData = {
                      intentId: 1, // Target the Game Console intent
                      company,
                      product,
                      price,
                      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                      discount: originalPrice ? `$${parseFloat(originalPrice) - price} off` : "",
                      expiresAt: null
                    };
                    
                    const res = await apiRequest("POST", "/api/offers", offerData);
                    await res.json();
                    
                    // Refresh the offers list
                    queryClient.invalidateQueries({ queryKey: ["/api/user/offers"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
                    
                    setIsOfferDialogOpen(false);
                    toast({
                      title: "Offer Created Successfully",
                      description: "Your strategic offer has been published to the marketplace!",
                    });
                  } catch (error) {
                    toast({
                      title: "Failed to Create Offer",
                      description: "Please try again or contact support.",
                      variant: "destructive",
                    });
                  }
                }}
                className="flex-1"
              >
                Publish Offer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-md bg-primary-500 flex items-center justify-center mr-3">
              <Handshake className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">IntentMarket</CardTitle>
          </div>
          <CardDescription>Connect consumers with producers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="Enter your username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleLogin(loginUsername || "Consumer User", "consumer")}
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending ? "Logging in..." : "Login as Consumer"}
              </Button>
              <Button 
                onClick={() => handleLogin(loginUsername || "Producer User", "producer")}
                variant="outline"
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending ? "Logging in..." : "Login as Company"}
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Quick Test Accounts:</p>
              <div className="flex gap-2 justify-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLoginUsername("John Consumer")}
                >
                  John Consumer
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLoginUsername("TechCorp Producer")}
                >
                  TechCorp Company
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}