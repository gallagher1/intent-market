import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Inbox, 
  Target, 
  Search, 
  BarChart3, 
  Settings, 
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface NavigationProps {
  userType: 'consumer' | 'company';
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userName: string;
  notifications?: {
    offers: number;
    messages: number;
    alerts: number;
  };
}

export function MainNavigation({ 
  userType, 
  currentView, 
  onViewChange, 
  onLogout, 
  userName,
  notifications = { offers: 0, messages: 0, alerts: 0 }
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const consumerNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and quick actions'
    },
    {
      id: 'create-intent',
      label: 'Create Intent',
      icon: Plus,
      description: 'Post a new purchase intent',
      highlight: true
    },
    {
      id: 'intent-feed',
      label: 'My Intents',
      icon: Target,
      description: 'Manage your purchase intents'
    },
    {
      id: 'offer-inbox',
      label: 'Offer Inbox',
      icon: Inbox,
      description: 'Review and manage offers',
      badge: notifications.offers
    },
    {
      id: 'purchase-history',
      label: 'Purchase History',
      icon: BarChart3,
      description: 'View completed purchases'
    }
  ];

  const companyNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      id: 'offer-builder',
      label: 'Offer Builder',
      icon: Plus,
      description: 'Research market & create offers',
      highlight: true
    },
    {
      id: 'my-offers',
      label: 'My Offers',
      icon: Inbox,
      description: 'Track your offers',
      badge: notifications.messages
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance insights'
    }
  ];

  const navItems = userType === 'consumer' ? consumerNavItems : companyNavItems;
  const totalNotifications = notifications.offers + notifications.messages + notifications.alerts;

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:z-30">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center flex-shrink-0 px-4 pb-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">IntentMarket</h1>
                <p className="text-xs text-gray-500 capitalize">{userType} Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 ${
                    item.highlight && !isActive ? 'border border-primary/20 bg-primary/5' : ''
                  }`}
                  onClick={() => onViewChange(item.id)}
                >
                  <div className="flex items-center w-full">
                    <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 px-2 pb-4">
            <div className="border-t border-gray-200 pt-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                className="w-full justify-start mb-2"
                onClick={() => onViewChange('notifications')}
              >
                <Bell className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm">Notifications</span>
                {totalNotifications > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {totalNotifications}
                  </Badge>
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                className="w-full justify-start mb-2"
                onClick={() => onViewChange('settings')}
              >
                <Settings className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm">Settings</span>
              </Button>

              {/* User Profile */}
              <Card className="p-3 bg-gray-50">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userType}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="h-8 w-8 p-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-40">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">IntentMarket</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {totalNotifications > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('notifications')}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {totalNotifications}
                </Badge>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 inset-x-0 bg-white border-b border-gray-200 shadow-lg z-30">
            <div className="px-4 py-2">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        onViewChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      onViewChange('settings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </Button>
                  
                  <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{userName}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  );
}