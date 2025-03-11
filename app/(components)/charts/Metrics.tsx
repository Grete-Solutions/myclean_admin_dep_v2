'use client'
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, CalendarClock, DollarSign, Trash2, Truck, Users } from 'lucide-react';
import React from 'react';

// Sample revenue data for the chart


// Interface for metric cards
interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

// Card component for metric cards
const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive, icon, subtitle }) => {
  return (
    <Card>
      <CardContent className="">
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="bg-gray-100 rounded-full p-2">{icon}</div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{value}</span>
          {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
          <div className="flex items-center mt-1">
            <span className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Collection Efficiency Table

// Revenue Chart Component

// Main Dashboard Component
const WasteManagementDashboard: React.FC = () => {
  return (
    <div className="p-6 min-h-full">
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Total Customers" 
          value="3,842" 
          subtitle="Active accounts"
          change="+2.8%" 
          isPositive={true} 
          icon={<Users size={18} />}
        />
        <MetricCard 
          title="Active Drivers" 
          value="27" 
          subtitle="94% availability"
          change="+1" 
          isPositive={true}
          icon={<Truck size={18} />} 
        />
        <MetricCard 
          title="Monthly Revenue" 
          value="$54,280" 
          subtitle="$985 avg per route"
          change="+4.2%" 
          isPositive={true}
          icon={<DollarSign size={18} />} 
        />
        <MetricCard 
          title="Waste Collected" 
          value="845 tons" 
          subtitle="22% recyclables"
          change="+1.7%" 
          isPositive={true}
          icon={<Trash2 size={18} />} 
        />
      </div>
      
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <MetricCard 
          title="On-Time Collections" 
          value="94.3%" 
          change="-0.8%" 
          isPositive={false} 
          icon={<CalendarClock size={18} />}
        />
        <MetricCard 
          title="Customer Complaints" 
          value="18" 
          change="-25%" 
          isPositive={true}
          icon={<AlertTriangle size={18} />} 
        />
        <MetricCard 
          title="Recycling Rate" 
          value="22.4%" 
          change="+1.2%" 
          isPositive={true}
          icon={<BarChart3 size={18} />} 
        />
      </div>
      

    </div>
  );
};

export default WasteManagementDashboard;