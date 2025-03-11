'use client'

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const UserChart = () => {
    const userData = [
      { month: 'Jan', users: 100 },
      { month: 'Feb', users: 150 },
      { month: 'Mar', users: 200 },
      { month: 'Apr', users: 250 },
      { month: 'May', users: 300 },
      { month: 'Jun', users: 350 },
      { month: 'Jul', users: 400 },
      { month: 'Aug', users: 450 },
      { month: 'Sep', users: 500 },
      { month: 'Oct', users: 550 },
      { month: 'Nov', users: 600 },
      { month: 'Dec', users: 650 },
    ];
    
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">User Growth Trend</CardTitle>
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
              <span>650</span>
              <span className="text-green-400 ml-1">+20%</span>
            </div>
          </div>
          <div className="flex justify-around mt-4">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Users</div>
          </div>
        </CardContent>
      </Card>
    );
}