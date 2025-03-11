'use client'

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const PickupChart = () => {
    const trendData = [
      { name: '0', completed: 20, pending: 10, cancelled: 5 },
      { name: '1', completed: 25, pending: 12, cancelled: 7 },
      { name: '2', completed: 30, pending: 15, cancelled: 9 },
      { name: '3', completed: 40, pending: 20, cancelled: 10 },
      { name: '4', completed: 55, pending: 30, cancelled: 12 },
      { name: '5', completed: 70, pending: 40, cancelled: 15 },
      { name: '6', completed: 85, pending: 50, cancelled: 18 },
    ];
    
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
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pending" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cancelled" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-4">
            <div className="bg-black text-white px-2 py-1 rounded-full text-xs flex items-center">
              <span>36</span>
              <span className="text-green-400 ml-1">+12%</span>
            </div>
          </div>
          <div className="flex justify-around mt-4">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Completed</div>
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Pending</div>
            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs">Cancelled</div>
          </div>
        </CardContent>
      </Card>
    );
}