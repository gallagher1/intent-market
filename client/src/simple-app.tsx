import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QueryClientProvider, QueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ConsumerDashboard from "@/pages/consumer/dashboard";
import ConsumerIntents from "@/pages/consumer/intents";
import ConsumerOffers from "@/pages/consumer/offers";
import ConsumerPurchases from "@/pages/consumer/purchases";
import ProducerDashboard from "@/pages/producer/dashboard";
import BrowseIntents from "@/pages/producer/browse-intents";
import MyOffers from "@/pages/producer/my-offers";

// Create a client
const queryClient = new QueryClient();

// Auth Context
import { createContext, useContext } from "react";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (data: { username: string; password: string }) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  const { 
    data: user, 
    error,
    isLoading,
    refetch 
  } = useQuery<SelectUser | null, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await res.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return await res.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
    },
  });

  const login = async (credentials: { username: string; password: string }) => {
    try {
      await loginMutation.mutateAsync(credentials);
      await refetch();
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (err) {
      toast({
        title: 'Login failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const register = async (userData: InsertUser) => {
    try {
      await registerMutation.mutateAsync(userData);
      await refetch();
      toast({
        title: 'Registration successful',
        description: 'Your account has been created!',
      });
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await refetch();
      toast({
        title: 'Logged out successfully',
      });
    } catch (err) {
      toast({
        title: 'Logout failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return user ? <>{children}</> : null;
}

// Auth Page Component
function AuthPageWrapper() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return <AuthPage />;
}

// Router Component
function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPageWrapper />
      </Route>
      
      <Route path="/">
        <ProtectedRoute>
          <ConsumerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/intents">
        <ProtectedRoute>
          <ConsumerIntents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/offers">
        <ProtectedRoute>
          <ConsumerOffers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/purchases">
        <ProtectedRoute>
          <ConsumerPurchases />
        </ProtectedRoute>
      </Route>
      
      <Route path="/producer">
        <ProtectedRoute>
          <ProducerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/producer/browse-intents">
        <ProtectedRoute>
          <BrowseIntents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/producer/my-offers">
        <ProtectedRoute>
          <MyOffers />
        </ProtectedRoute>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;