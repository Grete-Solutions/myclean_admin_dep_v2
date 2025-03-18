'use client'

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2 } from 'lucide-react';

// Define types for API response and pickup data
interface PickupLocation {
  _latitude: number;
  _longitude: number;
}

interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface Pickup {
  id: string;
  vehicleColor: string;
  userPhone: string;
  pickupLocation: PickupLocation;
  userId: string;
  vehicleMake: string;
  createdAt: Timestamp;
  profilePicture: string;
  sorted: boolean;
  vehicleLicenseNumber: string;
  driver: string;
  driverId: string;
  trips: number;
  driverPhone: string;
  user: string;
  bookingId: string;
  status: 'completed' | 'pending' | 'cancelled';
  updatedAt: Timestamp;
  actualPrice: number;
  netPrice: number;
  ended: boolean;
  rating: number;
  commentByUser: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  count: number;
  data: Pickup[];
}

export const AnalyticsOverview: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [revenueChange, setRevenueChange] = useState<number>(0);
  const [activeVehicles, setActiveVehicles] = useState<number>(0);
  const [vehicleChange, setVehicleChange] = useState<number>(0);
  const [onRouteVehicles, setOnRouteVehicles] = useState<number>(0);

  useEffect(() => {
    const fetchPickupData = async () => {
      try {
        const response = await fetch('/api/GET/pickups/getallpickups');
        const result: ApiResponse = await response.json();
        
        if (result.success) {
          processPickupData(result.data);
        } else {
          console.error('Failed to fetch pickup data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching pickup data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPickupData();
  }, []);

  const processPickupData = (data: Pickup[]) => {
    const today = new Date();
    
    // Current week data
    let currentWeekRevenue = 0;
    const currentWeekVehicles = new Set<string>();
    let pendingPickups = 0;
    
    // Previous week data
    let previousWeekRevenue = 0;
    const previousWeekVehicles = new Set<string>();
    
    // All unique vehicles
    const allVehicles = new Set<string>();
    
    // Process each pickup
    data.forEach((pickup: Pickup) => {
      if (pickup.createdAt && pickup.createdAt._seconds) {
        const pickupDate = new Date(pickup.createdAt._seconds * 1000);
        const dayDiff = Math.floor((today.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Current week (last 7 days)
        if (dayDiff >= 0 && dayDiff < 7) {
          if (pickup.status === 'completed') {
            currentWeekRevenue += pickup.actualPrice;
            currentWeekVehicles.add(pickup.vehicleLicenseNumber);
          }
          
          if (pickup.status === 'pending') {
            pendingPickups++;
            
            // Consider pending pickups as "on route"
            allVehicles.add(pickup.vehicleLicenseNumber);
          }
          
          allVehicles.add(pickup.vehicleLicenseNumber);
        } 
        // Previous week (8-14 days ago)
        else if (dayDiff >= 7 && dayDiff < 14) {
          if (pickup.status === 'completed') {
            previousWeekRevenue += pickup.actualPrice;
            previousWeekVehicles.add(pickup.vehicleLicenseNumber);
          }
        }
      }
    });
    
    // Calculate change percentages
    const revenueChangePercent = previousWeekRevenue > 0 
      ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
      : 0;
      
    const vehicleChangePercent = previousWeekVehicles.size > 0 
      ? ((currentWeekVehicles.size - previousWeekVehicles.size) / previousWeekVehicles.size) * 100 
      : 0;
    
    // Update state
    setTotalRevenue(currentWeekRevenue);
    setRevenueChange(revenueChangePercent);
    setActiveVehicles(allVehicles.size);
    setVehicleChange(vehicleChangePercent);
    setOnRouteVehicles(pendingPickups);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Analytics Overview</div>
            <MoreHorizontal size={16} />
          </div>
          <div className="text-xs text-gray-500 mb-4">Total pickup revenue overview</div>
          
          <div className="flex justify-center items-center my-6 relative">
            <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold">GH₵ {totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`text-xs flex items-center justify-center ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(revenueChange).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">than last week</div>
              </div>
            </div>
            <div className="absolute -top-4 right-0 w-16 h-16 border-8 border-blue-300 rounded-full border-l-transparent border-b-transparent rotate-45"></div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">Pickup Vehicles</div>
              <MoreHorizontal size={16} />
            </div>
            <div className="text-xs text-gray-500 mb-4">Vehicles operating on the road</div>
            
            <div className="flex items-center space-x-4 mt-4">
              <div className="text-4xl font-bold">{activeVehicles}</div>
              <div className="flex flex-col">
                <span className={`text-xs flex items-center ${vehicleChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {vehicleChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(vehicleChange).toFixed(2)}%
                </span>
                <span className="text-xs text-gray-500">than last week</span>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <div className="bg-green-100 text-green-600 rounded-full px-2 py-1 text-xs flex items-center mr-2">
                <div className="bg-green-500 rounded-full w-2 h-2 mr-1"></div>
                On-Route: {onRouteVehicles}
              </div>
              <div className="ml-auto relative w-24 h-14">
                <img
                  src="https://i.pinimg.com/736x/a4/b5/d6/a4b5d6ed94f98e21f9d2e311b32d5396.jpg"
                  alt="Pickup Vehicle"
                  sizes="100px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsOverview;