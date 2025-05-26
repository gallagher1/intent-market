import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, CheckCircle } from "lucide-react";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Register schema
const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  userType: z.enum(["consumer", "producer"]),
});

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      userType: "consumer",
    },
  });

  // Handle login submit
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle register submit
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await register(values);
      navigate("/");
    } catch (error) {
      console.error("Register error:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center p-4">
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
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary-600 hover:bg-primary-700"
                      >
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button 
                      className="text-primary-600 hover:text-primary-500"
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
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                              <Button 
                                type="button"
                                className={`flex items-center justify-center ${
                                  field.value === "consumer" 
                                    ? "bg-primary-100 text-primary-700 border-primary-300" 
                                    : "bg-white text-gray-700 border-gray-300"
                                } border rounded-md p-3 h-auto`}
                                onClick={() => registerForm.setValue("userType", "consumer")}
                              >
                                Consumer
                              </Button>
                              <Button 
                                type="button"
                                className={`flex items-center justify-center ${
                                  field.value === "producer" 
                                    ? "bg-primary-100 text-primary-700 border-primary-300" 
                                    : "bg-white text-gray-700 border-gray-300"
                                } border rounded-md p-3 h-auto`}
                                onClick={() => registerForm.setValue("userType", "producer")}
                              >
                                Producer
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary-600 hover:bg-primary-700"
                      >
                        Register
                      </Button>
                    </form>
                  </Form>
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