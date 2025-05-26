import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Intent } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { IntentCard } from "@/components/intent/intent-card";
import { CreateIntentForm } from "@/components/intent/create-intent-form";
import { IntentDetails } from "@/components/intent/intent-details";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, Target, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConsumerIntents() {
  const [isCreateIntentOpen, setIsCreateIntentOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch user's intents
  const { data: intents, isLoading } = useQuery<Intent[]>({
    queryKey: ["/api/user/intents"],
  });
  
  // Filter intents based on status
  const filteredIntents = intents?.filter(intent => {
    if (statusFilter === "all") return true;
    return intent.status === statusFilter;
  }) || [];
  
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
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Intents</h1>
              <p className="mt-1 text-sm text-gray-500">Manage all your purchase intents</p>
            </div>
            <Button 
              onClick={() => setIsCreateIntentOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              New Intent
            </Button>
          </div>
          
          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <Tabs defaultValue="all" onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
          
          {/* Intents Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : filteredIntents.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIntents.map(intent => (
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">No intents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === "all" 
                  ? "You haven't created any purchase intents yet." 
                  : `You don't have any ${statusFilter} intents.`}
              </p>
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
