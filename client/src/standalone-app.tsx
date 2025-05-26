import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Handshake } from "lucide-react";

type User = {
  id: number;
  name: string;
  username: string;
  userType: 'consumer' | 'producer';
};

export default function StandaloneApp() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();

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
    
    // Mock user login - in a real app, this would call the API
    setTimeout(() => {
      setUser({
        id: 1,
        name: "Test User",
        username: loginUsername,
        userType: 'consumer',
      });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    }, 500);
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
    
    // Immediate user registration for better UX
    setUser({
      id: 1,
      name: registerName,
      username: registerUsername,
      userType: registerUserType,
    });
    
    toast({
      title: "Registration successful",
      description: "Your account has been created!",
    });
  };

  // Mock logout function
  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged out successfully",
    });
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

  // If the user is logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Toaster />
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-primary-500 flex items-center justify-center mr-3">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">IntentMarket</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
            <p className="text-gray-600">
              You are logged in as a {user.userType === 'consumer' ? 'Consumer' : 'Producer'}.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Dashboard</CardTitle>
                <CardDescription>
                  {user.userType === 'consumer' 
                    ? 'Manage your purchase intents and offers' 
                    : 'Browse consumer intents and create offers'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This is a simplified demo of the IntentMarket platform. In the full application, 
                  you would see your {user.userType === 'consumer' ? 'intents and received offers' : 'available intents and your offers'} here.
                </p>
                
                {user.userType === 'consumer' ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="w-full">Create Intent</Button>
                      <Button className="w-full" variant="outline">View Offers</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="w-full">Browse Intents</Button>
                      <Button className="w-full" variant="outline">My Offers</Button>
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
                {user.userType === 'consumer' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Active Intents</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">New Offers</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Completed Purchases</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Potential Savings</div>
                      <div className="text-2xl font-bold">$0</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Total Offers</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Pending Offers</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Accepted Offers</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Conversion Rate</div>
                      <div className="text-2xl font-bold">0%</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      Login
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button 
                      className="text-primary-600 hover:text-primary-500 font-medium"
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
                          className={`flex items-center justify-center ${
                            registerUserType === "consumer" 
                              ? "bg-primary-100 text-primary-700 border-primary-300" 
                              : "bg-white text-gray-700 border-gray-300"
                          } border rounded-md p-3 h-auto`}
                          onClick={() => setRegisterUserType("consumer")}
                        >
                          Consumer
                        </Button>
                        <Button 
                          type="button"
                          className={`flex items-center justify-center ${
                            registerUserType === "producer" 
                              ? "bg-primary-100 text-primary-700 border-primary-300" 
                              : "bg-white text-gray-700 border-gray-300"
                          } border rounded-md p-3 h-auto`}
                          onClick={() => setRegisterUserType("producer")}
                        >
                          Producer
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      Register
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <button 
                      className="text-primary-600 hover:text-primary-500"
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