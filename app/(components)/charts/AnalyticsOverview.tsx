import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import React from 'react';
export const AnalyticsOverview: React.FC = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium">Analityc view</div>
          <MoreHorizontal size={16} />
        </div>
        <div className="text-xs text-gray-500 mb-4">Total shipping revenue overview</div>
        
        <div className="flex justify-center items-center my-6 relative">
          <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold">$ 272,980.19</div>
              <div className="text-xs flex items-center justify-center text-green-500">
                <ArrowUpRight size={12} />
                +2.52%
              </div>
              <div className="text-xs text-gray-500">than last week</div>
            </div>
          </div>
          <div className="absolute -top-4 right-0 w-16 h-16 border-8 border-blue-300 rounded-full border-l-transparent border-b-transparent rotate-45"></div>
        </div>
  
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Delivery Vehicles</div>
            <MoreHorizontal size={16} />
          </div>
          <div className="text-xs text-gray-500 mb-4">Vehicles operating on the road</div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="text-4xl font-bold">89</div>
            <div className="flex flex-col">
              <span className="text-xs flex items-center text-green-500">
                <ArrowUpRight size={12} />
                +2.29%
              </span>
              <span className="text-xs text-gray-500">than last week</span>
            </div>
          </div>
  
          <div className="flex items-center mt-4">
            <div className="bg-green-100 text-green-600 rounded-full px-2 py-1 text-xs flex items-center mr-2">
              <div className="bg-green-500 rounded-full w-2 h-2 mr-1"></div>
              On-Route
            </div>
            <img src="https://i.pinimg.com/736x/a4/b5/d6/a4b5d6ed94f98e21f9d2e311b32d5396.jpg" alt="Delivery Van" className="ml-auto" />
          </div>
        </div>
      </div>
    );
    
  };