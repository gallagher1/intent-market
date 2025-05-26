import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Intent } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { StatCard } from "@/components/ui/stat-card";
import { IntentCard } from "@/components/intent/intent-card";
import { CreateIntentForm } from "@/components/intent/create-intent-form";
import { IntentDetails } from "@/components/intent/intent-details";
import { OfferListItem } from "@/components/offer/offer-list-item";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Tag, ShoppingCart, DollarSign, Bell, Filter, PlusIcon } from "lucide-react";

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const [isCreateIntentOpen, setIsCreateIntentOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  
  // Fetch user's active intents
  const { data: intents, isLoading: isIntentsLoading } = useQuery<Intent[]>({
    queryKey: ["/api/user/intents"],
  });
  
  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
  });
  
  // Filter active intents
  const activeIntents = intents?.filter(intent => intent.status === "active") || [];
  
  // Handle view offers
  const handleViewOffers = (intentId: number) => {
    const intent = intents?.find(i => i.id === intentId);
    if (intent) {
      setSelectedIntent(intent);
    }
  };
  
  // Handle edit intent
  const handleEditIntent = (intent: Intent) => {
    // For now, just open create intent form
    // In a real app, we would populate the form with intent data
    setIsCreateIntentOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Consumer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your purchase intents and offers</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {isStatsLoading ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="ml-5 w-0 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-12 mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <StatCard
                  title="Active Intents"
                  value={stats?.activeIntents || 0}
                  icon={<Target className="h-5 w-5" />}
                  iconBgColor="bg-primary-100"
                  iconColor="text-primary-600"
                />
                <StatCard
                  title="New Offers"
                  value={stats?.newOffers || 0}
                  icon={<Tag className="h-5 w-5" />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />
                <StatCard
                  title="Completed Purchases"
                  value={stats?.completedPurchases || 0}
                  icon={<ShoppingCart className="h-5 w-5" />}
                  iconBgColor="bg-secondary-100"
                  iconColor="text-secondary-600"
                />
                <StatCard
                  title="Potential Savings"
                  value={`$${(stats?.potentialSavings || 0).toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                  iconBgColor="bg-yellow-100"
                  iconColor="text-yellow-600"
                />
              </>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button 
                className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setIsCreateIntentOpen(true)}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create New Intent
              </Button>
              <Button 
                variant="outline"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Bell className="mr-2 h-4 w-4" />
                View All Notifications
              </Button>
              <Button 
                variant="outline"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter Offers
              </Button>
            </div>
          </div>
          
          {/* Active Intents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Active Intents</h2>
              <Link href="/intents" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View All <span aria-hidden="true">→</span>
              </Link>
            </div>
            
            {isIntentsLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white shadow rounded-lg p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-5 w-24 ml-3" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-9 w-full rounded-md" />
                      <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeIntents.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {activeIntents.slice(0, 3).map(intent => (
                  <IntentCard 
                    key={intent.id} 
                    intent={intent}
                    onViewOffers={handleViewOffers}
                    onEdit={handleEditIntent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Target className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No active intents</h3>
                <p className="mt-1 text-sm text-gray-500">Create an intent to start receiving offers from producers.</p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsCreateIntentOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New Intent
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Offers */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Offers</h2>
              <Link href="/offers" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View All <span aria-hidden="true">→</span>
              </Link>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {isIntentsLoading ? (
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-4 w-16 ml-auto" />
                          <Skeleton className="h-4 w-12 ml-auto" />
                          <Skeleton className="h-8 w-20 ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {/* This is a simplified version. In a real app, you would fetch offers for all intents */}
                  <li className="p-4 hover:bg-gray-50">
                    <div className="text-center py-8">
                      <Tag className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-gray-500">Select an intent to view offers</p>
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Create Intent Modal */}
      <CreateIntentForm 
        isOpen={isCreateIntentOpen} 
        onClose={() => setIsCreateIntentOpen(false)} 
      />
      
      {/* Intent Details Modal */}
      <Dialog open={!!selectedIntent} onOpenChange={() => setSelectedIntent(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedIntent && <IntentDetails intent={selectedIntent} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
