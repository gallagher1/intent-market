import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Handshake, Home, Target, Tag, ShoppingCart, ChartLine, Search, Send, PieChart, Zap, LogOut, Settings } from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isConsumer = user.userType === "consumer";
  const isProducer = user.userType === "producer";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getLinkClass = (path: string) => {
    const isActive = location === path;
    return `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
      isActive
        ? "bg-primary-50 text-primary-700"
        : "text-gray-700 hover:bg-gray-50"
    }`;
  };

  const getIconClass = (path: string) => {
    const isActive = location === path;
    return `mr-3 ${
      isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500"
    }`;
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary-500 flex items-center justify-center">
            <Handshake className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">IntentMarket</h1>
        </div>
      </div>
      
      {/* User profile section */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-800">{user.name}</h3>
            <p className="text-xs text-gray-500">{user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</p>
          </div>
          <div className="ml-auto">
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-2 flex-1 overflow-y-auto">
        {isConsumer && (
          <div className="mb-4">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumer</h4>
            <div className="mt-2 space-y-1">
              <Link href="/" className={getLinkClass("/")}>
                <Home className={`h-5 w-5 ${getIconClass("/")}`} />
                Dashboard
              </Link>
              <Link href="/intents" className={getLinkClass("/intents")}>
                <Target className={`h-5 w-5 ${getIconClass("/intents")}`} />
                My Intents
              </Link>
              <Link href="/offers" className={getLinkClass("/offers")}>
                <Tag className={`h-5 w-5 ${getIconClass("/offers")}`} />
                Offers
              </Link>
              <Link href="/purchases" className={getLinkClass("/purchases")}>
                <ShoppingCart className={`h-5 w-5 ${getIconClass("/purchases")}`} />
                Purchases
              </Link>
            </div>
          </div>
        )}
        
        {isProducer && (
          <div className="mb-4">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producer</h4>
            <div className="mt-2 space-y-1">
              <Link href="/producer" className={getLinkClass("/producer")}>
                <ChartLine className={`h-5 w-5 ${getIconClass("/producer")}`} />
                Producer Dashboard
              </Link>
              <Link href="/producer/browse-intents" className={getLinkClass("/producer/browse-intents")}>
                <Search className={`h-5 w-5 ${getIconClass("/producer/browse-intents")}`} />
                Browse Intents
              </Link>
              <Link href="/producer/my-offers" className={getLinkClass("/producer/my-offers")}>
                <Send className={`h-5 w-5 ${getIconClass("/producer/my-offers")}`} />
                My Offers
              </Link>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</h4>
          <div className="mt-2 space-y-1">
            <Link href="#" className={getLinkClass("")}>
              <PieChart className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              Reports
            </Link>
            <Link href="#" className={getLinkClass("")}>
              <Zap className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              Activity
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout} 
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
