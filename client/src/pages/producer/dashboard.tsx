import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Intent, Offer } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-nav";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChartLine, 
  Send, 
  CheckCircle, 
  Clock, 
  Target, 
  Tag, 
  DollarSign, 
  Users 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function ProducerDashboard() {
  // Fetch producer stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
  });
  
  // Fetch producer's offers
  const { data: offers, isLoading: isOffersLoading } = useQuery<Offer[]>({
    queryKey: ["/api/user/offers"],
  });
  
  const isLoading = isStatsLoading || isOffersLoading;
  
  // Mock chart data based on offers
  // In a real app, you would fetch this from an analytics endpoint
  const getChartData = () => {
    if (!offers) return [];
    
    // Group offers by date (using day as key)
    const today = new Date();
    const grouped = {};
    
    // Create the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = { sent: 0, accepted: 0 };
    }
    
    // Count offers by date
    offers.forEach(offer => {
      const dateStr = new Date(offer.createdAt).toISOString().split('T')[0];
      if (grouped[dateStr]) {
        grouped[dateStr].sent += 1;
        if (offer.status === "accepted") {
          grouped[dateStr].accepted += 1;
        }
      }
    });
    
    // Convert to array for chart
    return Object.entries(grouped).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent: data.sent,
      accepted: data.accepted,
    }));
  };
  
  const chartData = getChartData();
  
  // Get recent offers
  const recentOffers = offers
    ? [...offers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    : [];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Producer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor your offers and performance</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {isLoading ? (
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
                  title="Total Offers"
                  value={stats?.totalOffers || 0}
                  icon={<Send className="h-5 w-5" />}
                  iconBgColor="bg-primary-100"
                  iconColor="text-primary-600"
                />
                <StatCard
                  title="Pending Offers"
                  value={stats?.pendingOffers || 0}
                  icon={<Clock className="h-5 w-5" />}
                  iconBgColor="bg-yellow-100"
                  iconColor="text-yellow-600"
                />
                <StatCard
                  title="Accepted Offers"
                  value={stats?.acceptedOffers || 0}
                  icon={<CheckCircle className="h-5 w-5" />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />
                <StatCard
                  title="Conversion Rate"
                  value={stats?.totalOffers 
                    ? `${Math.round((stats.acceptedOffers / stats.totalOffers) * 100)}%` 
                    : "0%"}
                  icon={<ChartLine className="h-5 w-5" />}
                  iconBgColor="bg-secondary-100"
                  iconColor="text-secondary-600"
                />
              </>
            )}
          </div>
          
          {/* Activity Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Offer Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" name="Offers Sent" fill="#3b82f6" />
                      <Bar dataKey="accepted" name="Offers Accepted" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-blue-800">Available Consumer Intents</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : "24"}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      +5 new since yesterday
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                    <Tag className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-green-800">Offer Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-900">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        stats?.totalOffers 
                          ? `${Math.round((stats.acceptedOffers / stats.totalOffers) * 100)}%` 
                          : "0%"
                      )}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Industry avg: 12%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-purple-800">Target Consumer Reach</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : "178"}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      +15% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Offers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Offers</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary-600 border-primary-200 hover:bg-primary-50"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-4 w-12 ml-auto mt-1" />
                        <Skeleton className="h-8 w-20 ml-auto mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOffers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentOffers.map(offer => (
                    <li key={offer.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <Target className="text-gray-500 h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {offer.product}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Intent ID: {offer.intentId}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full 
                              ${offer.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                                offer.status === "accepted" ? "bg-green-100 text-green-800" :
                                "bg-gray-100 text-gray-800"}
                            `}>
                              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {new Date(offer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${offer.price.toLocaleString()}</p>
                          {offer.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">${offer.originalPrice.toLocaleString()}</p>
                          )}
                          <div className="mt-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">No offers made yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Browse consumer intents to make targeted offers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
