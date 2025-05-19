'use client'
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export const PickupsByRegion = () => {
    const regionData = [
      { name: 'Greater Accra', value: 20.5, color: '#3b82f6' },
      { name: 'Ashanti', value: 15.8, color: '#10b981' },
      { name: 'Western', value: 7.2, color: '#f59e0b' },
      { name: 'Northern', value: 5.6, color: '#9ca3af' },
      { name: 'Eastern', value: 4.3, color: '#ef4444' },
    ];
    
    const total = regionData.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">Pickups by Service Area</CardTitle>
          <div className="flex space-x-2">
            <button className="p-1">
              <span className="sr-only">Download</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button className="p-1">
              <span className="sr-only">More</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="flex">
            <div className="w-1/2 p-4 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-3xl font-bold">${total.toFixed(1)}M</h3>
                <p className="text-gray-500 text-sm">Total Pickups</p>
              </div>
            </div>
            <div className="w-1/2 p-4">
              <ul className="space-y-2">
                {regionData.map((item) => (
                  <li key={item.name} className="flex justify-between">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                      <span>{item.name}</span>
                    </div>
                    <span>GH₵{item.value}M</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
};
