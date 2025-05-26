import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Handshake, Home, Target, Tag, User, ChartLine, Search, Send, PieChart, Zap, LogOut } from "lucide-react";

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isConsumer = user.userType === "consumer";
  const isProducer = user.userType === "producer";

  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setMenuOpen(false);
  };

  return (
    <>
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary-500 flex items-center justify-center">
              <Handshake className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">IntentMarket</h1>
          </div>
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile menu */}
        <div className={`${menuOpen ? 'block' : 'hidden'} p-4 border-t border-gray-200 bg-white`}>
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-800">{user.name}</h3>
              <p className="text-xs text-gray-500">{user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</p>
            </div>
          </div>
          
          <nav className="space-y-6">
            {isConsumer && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumer</h4>
                <div className="mt-2 space-y-1">
                  <Link 
                    href="/" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/intents" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/intents" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    My Intents
                  </Link>
                  <Link 
                    href="/offers" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/offers" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Offers
                  </Link>
                  <Link 
                    href="/purchases" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/purchases" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Purchases
                  </Link>
                </div>
              </div>
            )}
            
            {isProducer && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Producer</h4>
                <div className="mt-2 space-y-1">
                  <Link 
                    href="/producer" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/producer" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Producer Dashboard
                  </Link>
                  <Link 
                    href="/producer/browse-intents" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/producer/browse-intents" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Browse Intents
                  </Link>
                  <Link 
                    href="/producer/my-offers" 
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${location === "/producer/my-offers" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    My Offers
                  </Link>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</h4>
              <div className="mt-2 space-y-1">
                <Link 
                  href="#" 
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reports
                </Link>
                <Link 
                  href="#" 
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Activity
                </Link>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-4 h-16">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center ${location === "/" ? "text-primary-600" : "text-gray-500"}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link 
            href={isConsumer ? "/intents" : "/producer/browse-intents"} 
            className={`flex flex-col items-center justify-center ${
              location === "/intents" || location === "/producer/browse-intents" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <Target className="h-5 w-5" />
            <span className="text-xs mt-1">Intents</span>
          </Link>
          <Link 
            href={isConsumer ? "/offers" : "/producer/my-offers"} 
            className={`flex flex-col items-center justify-center ${
              location === "/offers" || location === "/producer/my-offers" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <Tag className="h-5 w-5" />
            <span className="text-xs mt-1">Offers</span>
          </Link>
          <Link 
            href="/purchases" 
            className={`flex flex-col items-center justify-center ${
              location === "/purchases" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
