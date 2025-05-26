import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

// Consumer pages
import ConsumerDashboard from "@/pages/consumer/dashboard";
import ConsumerIntents from "@/pages/consumer/intents";
import ConsumerOffers from "@/pages/consumer/offers";
import ConsumerPurchases from "@/pages/consumer/purchases";

// Producer pages
import ProducerDashboard from "@/pages/producer/dashboard";
import BrowseIntents from "@/pages/producer/browse-intents";
import MyOffers from "@/pages/producer/my-offers";
import { useAuth } from "./lib/auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

function ProtectedRoute(props: { 
  children: React.ReactNode;
}) {
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
  
  return user ? <>{props.children}</> : null;
}

function Router() {
  return (
    <Switch>
      {/* Auth page */}
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      {/* Consumer routes */}
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
      
      {/* Producer routes */}
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
      
      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;