'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Define types for the API response
interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  count: number;
  data: User[];
}

// Updated User interface to match actual API response
interface User {
  id: string;
  email: string;
  userType?: number;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  lastname?: string;
  firstname?: string;
  country?: string;
  city?: string;
  phone?: string;
  isDelete?: boolean;
  isDisable?: boolean;
  isSuspend?: boolean;
  // Removed status field as it's not in the API response
}

interface MonthlyData {
  month: string;
  users: number;
}

// Define proper types for the tooltip
interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export default function UserChart() {
  const [userData, setUserData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [yearToDate, setYearToDate] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/GET/user-management/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const apiResponse: ApiResponse = await response.json();
        
        if (!apiResponse.success) {
          throw new Error(apiResponse.message || 'Failed to get user data');
        }
        
        processUserData(apiResponse.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const processUserData = (users: User[]) => {
    // Get current date for determining the number of months to display
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Initialize an array with months up to the current month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsToDisplay = months.slice(0, currentMonth + 1);
    
    // Initialize counts for each month
    const monthlyCounts: MonthlyData[] = monthsToDisplay.map(month => ({ month, users: 0 }));
    
    // Count users by creation month
    users.forEach(user => {
      // Only process users that have createdAt timestamp and are not deleted/disabled/suspended
      if (user.createdAt && user.createdAt._seconds && 
          !user.isDelete && !user.isDisable && !user.isSuspend) {
        
        // Convert seconds to milliseconds for Date constructor
        const creationDate = new Date(user.createdAt._seconds * 1000);
        
        // Count users created in the current year
        if (creationDate.getFullYear() === currentYear) {
          const monthIndex = creationDate.getMonth();
          if (monthIndex <= currentMonth) {
            monthlyCounts[monthIndex].users += 1;
          }
        }
      }
    });
    
    // Calculate year-to-date total
    const totalUsers = monthlyCounts.reduce((sum, month) => sum + month.users, 0);
    setYearToDate(totalUsers);
    
    // Calculate growth rate (comparing current month to previous month)
    if (currentMonth > 0 && monthlyCounts[currentMonth - 1].users > 0) {
      const currentMonthUsers = monthlyCounts[currentMonth].users;
      const prevMonthUsers = monthlyCounts[currentMonth - 1].users;
      const growth = ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100;
      setGrowthRate(Number(growth.toFixed(1)));
    } else if (currentMonth > 0) {
      // If previous month had 0 users but current month has users, it's infinite growth
      // Set to 100% for display purposes
      const currentMonthUsers = monthlyCounts[currentMonth].users;
      if (currentMonthUsers > 0) {
        setGrowthRate(100);
      }
    }
    
    setUserData(monthlyCounts);
  };

  // Custom tooltip with proper TypeScript types
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value} users`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">User Growth Trend</CardTitle>
        </div>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p>Loading user data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">User Growth Trend</CardTitle>
        </div>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <CardTitle className="text-lg">Active Users Growth</CardTitle>
        <button className="p-1 hover:bg-gray-100 rounded">
          <span className="sr-only">More</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={userData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} stroke="#e0e4e7" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="users" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Stats section */}
        <div className="flex justify-center mt-4">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2">
            <span className="font-medium">{yearToDate} users YTD</span>
            {growthRate > 0 && (
              <span className="text-green-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +{growthRate}%
              </span>
            )}
            {growthRate < 0 && (
              <span className="text-red-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {growthRate}%
              </span>
            )}
            {growthRate === 0 && <span className="text-gray-400">0%</span>}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center mt-3">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
            Active Users (Non-deleted/disabled/suspended)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}