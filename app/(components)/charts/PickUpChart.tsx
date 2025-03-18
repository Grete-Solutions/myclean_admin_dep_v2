'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loader2, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

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

interface StatusCounts {
  completed: number;
  pending: number;
  cancelled: number;
  [key: string]: number;
}

interface DayData {
  name: string;
  completed: number;
  pending: number;
  cancelled: number;
  [key: string]: string | number;
}

interface TrendData {
  status: string;
  count: number;
  change: number;
  color: string;
}

export const PickupChart = () => {
  const [pickupData, setPickupData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatusCounts>({ completed: 0, pending: 0, cancelled: 0 });
  const [trends, setTrends] = useState<TrendData[]>([]);

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
    // Count status occurrences
    const statusCounts: StatusCounts = {
      completed: 0,
      pending: 0,
      cancelled: 0
    };
    
    data.forEach((pickup: Pickup) => {
      const status = pickup.status;
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    });
    
    setStats(statusCounts);
    
    // Group by days (last 7 days)
    const today = new Date();
    const dayData: Record<string, DayData> = {};
    
    // Initialize days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.getDate().toString();
      dayData[dayStr] = { name: dayStr, completed: 0, pending: 0, cancelled: 0 };
    }
    
    // Fill with data
    data.forEach((pickup: Pickup) => {
      if (pickup.createdAt && pickup.createdAt._seconds) {
        const pickupDate = new Date(pickup.createdAt._seconds * 1000);
        const dayDiff = Math.floor((today.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff >= 0 && dayDiff < 7) {
          const dayStr = pickupDate.getDate().toString();
          if (dayData[dayStr] && pickup.status in statusCounts) {
            dayData[dayStr][pickup.status]++;
          }
        }
      }
    });
    
    const chartData = Object.values(dayData);
    setPickupData(chartData);
    
    // Calculate trends
    const trendData: TrendData[] = [];
    
    // Only calculate if we have enough data
    if (chartData.length >= 2) {
      const lastDay = chartData[chartData.length - 1];
      const prevDay = chartData[chartData.length - 2];
      
      // Calculate trends for each status
      const statusColors = {
        completed: "#3b82f6",
        pending: "#10b981",
        cancelled: "#f59e0b"
      };
      
      Object.entries(statusColors).forEach(([status, color]) => {
        const current = lastDay[status] as number;
        const previous = prevDay[status] as number;
        const change = previous === 0 
          ? 100 
          : Math.round(((current - previous) / previous) * 100);
          
        trendData.push({
          status,
          count: current,
          change,
          color: color as string
        });
      });
    }
    
    setTrends(trendData);
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) return <ArrowUp className="text-green-500" size={16} />;
    if (change < 0) return <ArrowDown className="text-red-500" size={16} />;
    return <ArrowRight className="text-gray-500" size={16} />;
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <CardTitle className="text-lg">Pickup Status Trend</CardTitle>
        <button className="p-1">
          <span className="sr-only">More</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </button>
      </div>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={pickupData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pending" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cancelled" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              {trends.map((item) => (
                <div key={item.status} className="bg-white shadow rounded-lg p-2 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-1">
                    <span className="text-xs capitalize">{item.status}</span>
                    <div className="flex items-center">
                      <TrendIcon change={item.change} />
                      <span className={`text-xs ml-1 ${
                        item.change > 0 ? 'text-green-500' : 
                        item.change < 0 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {Math.abs(item.change)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full mb-2">
                    <div 
                      className="h-1 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (stats[item.status] / (stats.completed + stats.pending + stats.cancelled)) * 100)}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                  <div className="text-lg font-semibold">{item.count}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-around mt-4">
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Completed</div>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Pending</div>
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs">Cancelled</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PickupChart;