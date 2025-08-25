'use client'

import React from "react";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, MapPin, Package, CreditCard, BarChart2 } from "lucide-react";
import { useSession } from 'next-auth/react';

// Static imports for components that don't use browser-only APIs
import WasteManagementDashboard from "@/app/(components)/charts/Metrics";

// Dynamic imports for potentially browser-dependent components
const AnalyticsOverview = dynamic(
  () => import('@/app/(components)/charts/AnalyticsOverview').then(mod => ({ default: mod.AnalyticsOverview })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading analytics overview...</div>
      </div>
    )
  }
);

const MapPreviewCard = dynamic(
  () => import('@/app/(components)/charts/MapPreview').then(mod => ({ default: mod.MapPreviewCard })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

const PickupChart = dynamic(
  () => import('@/app/(components)/charts/PickUpChart').then(mod => ({ default: mod.PickupChart })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading pickup chart...</div>
      </div>
    )
  }
);

const PickupDetails = dynamic(
  () => import('@/app/(components)/charts/PickUpDetails').then(mod => ({ default: mod.PickupDetails })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading pickup details...</div>
      </div>
    )
  }
);

const PickupsByRegion = dynamic(
  () => import('@/app/(components)/charts/PickupByRegion').then(mod => ({ default: mod.PickupsByRegion })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading regions chart...</div>
      </div>
    )
  }
);

const UserChart = dynamic(
  () => import('@/app/(components)/charts/UserChart'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading user chart...</div>
      </div>
    )
  }
);

// Function to determine greeting based on time of day
const getGreeting = () => {
  const hours = new Date().getHours();
  return hours < 12 ? 'Good Morning' : 'Good Afternoon';
};

function Analytics() {
  const { data: session } = useSession();
  const userName = session?.user?.displayName || 'Pascal';

  return (
    <div className="h-full">
      <header className="flex justify-between items-center p-6">
        <div>
          <div className="text-gray-500">Hello {userName},</div>
          <h1 className="text-2xl font-bold">{getGreeting()}</h1>
        </div>
        <div className="flex text-white space-x-3">
          <button className="bg-black text-white rounded-md px-3 py-1">
            General Overview
          </button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="px-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />Activity
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />Users
          </TabsTrigger>
          <TabsTrigger value="pickup" className="flex items-center gap-2">
            <Package className="h-4 w-4" />Pickup
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />Location
          </TabsTrigger>
          <TabsTrigger value="finances" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />Finances
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <WasteManagementDashboard />
            
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-8">
                <UserChart />
              </div>
              <div className="col-span-12 md:col-span-4">
                <AnalyticsOverview />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MapPreviewCard />
              <PickupsByRegion />
            </div>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Activity Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PickupChart />
              <PickupDetails />
            </div>
            <WasteManagementDashboard />
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">User Analytics</h2>
            <UserChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalyticsOverview />
              <div className="bg-white p-6 rounded-lg shadow">
                {/* Space for additional user metrics */}
                <h3 className="text-lg font-medium mb-4">User Demographics</h3>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500 text-sm">User demographics component will be added here</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Pickup Tab */}
        <TabsContent value="pickup">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pickup Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PickupChart />
              <PickupDetails />
            </div>
            <PickupsByRegion />
          </div>
        </TabsContent>
        
        {/* Location Tab */}
        <TabsContent value="location">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Location Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <MapPreviewCard />
              </div>
              <PickupsByRegion />
              <div className="bg-white p-6 rounded-lg shadow">
                {/* Space for additional location metrics */}
                <h3 className="text-lg font-medium mb-4">Service Coverage</h3>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Service coverage component will be added here</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Finances Tab */}
        <TabsContent value="finances">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Financial Analysis</h2>
            <WasteManagementDashboard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                {/* Space for financial metrics */}
                <h3 className="text-lg font-medium mb-4">Revenue Breakdown</h3>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Revenue component will be added here</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                {/* Space for expense metrics */}
                <h3 className="text-lg font-medium mb-4">Expense Analysis</h3>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Expense component will be added here</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Analytics;