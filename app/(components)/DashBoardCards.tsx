'use client'
import React from 'react';
import { AnalyticsOverview } from './charts/AnalyticsOverview';
import { MapPreviewCard } from './charts/MapPreview';
import { PickupChart } from './charts/PickUpChart';
import { PickupDetails } from './charts/PickUpDetails';
import { PickupsByRegion } from './charts/PickupByRegion';
import WasteManagementDashboard from './charts/Metrics';
import { useSession } from 'next-auth/react';
import UserChart from './charts/UserChart';

// Function to determine morning or afternoon
const getGreeting = () => {
  const hours = new Date().getHours();
  return hours < 12 ? 'Good Morning' : 'Good Afternoon';
};

// Header Component
const Header: React.FC = () => {
  const { data: session } = useSession();
  const userName = session?.user?.displayName || 'User';

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="text-gray-500">Hello {userName},</div>
        <h1 className="text-2xl font-bold">{getGreeting()}</h1>
      </div>
      <div className="flex text-white space-x-3">
        <button className="bg-black text-white rounded-md px-3 py-1">
          General Overview
        </button>
      </div>
    </div>
  );
};





// Main Dashboard Component
const DashboardCard: React.FC = () => {
  return (
    <div className="h-full w-full p-6">
      <Header />
      <WasteManagementDashboard />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <UserChart />
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="grid grid-cols-1 gap-6">
            <AnalyticsOverview />
          </div>
        </div>
      </div>
      <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-4">
        <PickupsByRegion />
        <MapPreviewCard />
        <PickupDetails />
        <PickupChart />
      </div>
    </div>
  );
};

export default DashboardCard;