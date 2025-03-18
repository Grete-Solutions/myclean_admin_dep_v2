'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

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

interface DayData {
  name: string;
  value1: number; // Completed count
  value2: number; // Pending count
  value3: number; // Cancelled count
  value4: number; // Total
  value5: number; // Rating average
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
}

export const PickupDetails = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [areaData, setAreaData] = useState<DayData[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([
    { title: "Total Requests", value: "0", change: 0 },
    { title: "Completed Rate", value: "0%", change: 0 },
    { title: "Avg. Rating", value: "0", change: 0 }
  ]);

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
    // Group by days (last 7 days)
    const today = new Date();
    const dayData: Record<string, DayData> = {};
    
    // Initialize last 7 days with empty data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.getDate().toString();
      dayData[dayStr] = { 
        name: dayStr, 
        value1: 0, // Completed
        value2: 0, // Pending
        value3: 0, // Cancelled
        value4: 0, // Total
        value5: 0  // Rating average
      };
    }
    
    // Total metrics
    const totalRequests = data.length;
    let completedCount = 0;
    let totalRatings = 0;
    let ratingSum = 0;
    
    // Previous week metrics (for trend calculation)
    let prevWeekRequests = 0;
    let prevCompletedCount = 0;
    let prevRatingSum = 0;
    let prevRatingCount = 0;
    
    // Process each pickup
    data.forEach((pickup: Pickup) => {
      if (pickup.createdAt && pickup.createdAt._seconds) {
        const pickupDate = new Date(pickup.createdAt._seconds * 1000);
        const dayDiff = Math.floor((today.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Update current week metrics
        if (dayDiff >= 0 && dayDiff < 7) {
          const dayStr = pickupDate.getDate().toString();
          if (dayData[dayStr]) {
            // Increment total
            dayData[dayStr].value4++;
            
            // Update by status
            if (pickup.status === 'completed') {
              dayData[dayStr].value1++;
              completedCount++;
              
              // Add rating if available
              if (pickup.rating) {
                dayData[dayStr].value5 += pickup.rating;
                ratingSum += pickup.rating;
                totalRatings++;
              }
            } else if (pickup.status === 'pending') {
              dayData[dayStr].value2++;
            } else if (pickup.status === 'cancelled') {
              dayData[dayStr].value3++;
            }
          }
        } 
        // Previous week data for trend calculation
        else if (dayDiff >= 7 && dayDiff < 14) {
          prevWeekRequests++;
          
          if (pickup.status === 'completed') {
            prevCompletedCount++;
            
            if (pickup.rating) {
              prevRatingSum += pickup.rating;
              prevRatingCount++;
            }
          }
        }
      }
    });
    
    // Calculate averages for each day
    Object.values(dayData).forEach(day => {
      if (day.value1 > 0) {
        day.value5 = day.value5 / day.value1; // Average rating for completed orders
      }
    });
    
    // Update metrics
    const completionRate = totalRequests > 0 ? (completedCount / totalRequests) * 100 : 0;
    const avgRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    
    // Calculate trends
    const prevCompletionRate = prevWeekRequests > 0 ? (prevCompletedCount / prevWeekRequests) * 100 : 0;
    const prevAvgRating = prevRatingCount > 0 ? prevRatingSum / prevRatingCount : 0;
    
    const requestsChange = prevWeekRequests > 0 ? ((totalRequests - prevWeekRequests) / prevWeekRequests) * 100 : 0;
    const completionChange = prevCompletionRate > 0 ? ((completionRate - prevCompletionRate) / prevCompletionRate) * 100 : 0;
    const ratingChange = prevAvgRating > 0 ? ((avgRating - prevAvgRating) / prevAvgRating) * 100 : 0;
    
    // Update metrics
    setMetrics([
      { title: "Total Requests", value: totalRequests.toLocaleString(), change: Math.round(requestsChange) },
      { title: "Completed Rate", value: `${Math.round(completionRate)}%`, change: Math.round(completionChange) },
      { title: "Avg. Rating", value: avgRating.toFixed(1), change: Math.round(ratingChange) }
    ]);
    
    // Convert daily data to array for chart
    setAreaData(Object.values(dayData));
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <CardTitle className="text-lg">Pickup Details</CardTitle>
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
            <div className="grid grid-cols-3 gap-4 mb-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.change !== 0 && (
                      <div className={`ml-2 flex items-center text-xs ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change > 0 ? (
                          <TrendingUp size={16} className="mr-1" />
                        ) : (
                          <TrendingDown size={16} className="mr-1" />
                        )}
                        {Math.abs(metric.change)}%
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{metric.title}</div>
                </div>
              ))}
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value1" 
                  name="Completed" 
                  stroke="#3b82f6" 
                  fillOpacity={0.3} 
                  fill="url(#colorCompleted)" 
                  stackId="1"
                />
                <Area 
                  type="monotone" 
                  dataKey="value2" 
                  name="Pending" 
                  stroke="#10b981" 
                  fillOpacity={0.3} 
                  fill="url(#colorPending)" 
                  stackId="1"
                />
                <Area 
                  type="monotone" 
                  dataKey="value3" 
                  name="Cancelled" 
                  stroke="#f59e0b" 
                  fillOpacity={0.3} 
                  fill="url(#colorCancelled)" 
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="flex justify-between pt-4">
              <div className="text-center">
                <div className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Completed
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Pending
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Cancelled
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PickupDetails;