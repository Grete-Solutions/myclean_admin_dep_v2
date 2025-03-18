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

// Define types for user data
interface User {
  id: string;
  userType: number;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  lastname: string;
  firstname: string;
  status: string;
  // Add other fields as needed
}

interface MonthlyData {
  month: string;
  users: number;
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
      if (user.createdAt && user.createdAt._seconds) {
        // Convert seconds to milliseconds for Date constructor
        const creationDate = new Date(user.createdAt._seconds * 1000);
        
        // Only count approved users created in the current year
        if (user.status === 'approved' && creationDate.getFullYear() === currentYear) {
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
    }
    
    setUserData(monthlyCounts);
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">User Growth Trend</CardTitle>
        </div>
        <CardContent className="flex items-center justify-center h-64">
          <p>Loading user data...</p>
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
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <CardTitle className="text-lg">Approved Users Growth</CardTitle>
        <button className="p-1">
          <span className="sr-only">More</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </button>
      </div>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={userData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-around mt-4">
          <div className="bg-black text-white px-2 py-1 rounded-full text-xs flex items-center">
            <span>{yearToDate} users</span>
            {growthRate > 0 && <span className="text-green-400 ml-1">+{growthRate}%</span>}
            {growthRate < 0 && <span className="text-red-400 ml-1">{growthRate}%</span>}
            {growthRate === 0 && <span className="text-gray-400 ml-1">0%</span>}
          </div>
        </div>
        <div className="flex justify-around mt-4">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Approved Users</div>
        </div>
      </CardContent>
    </Card>
  );
}