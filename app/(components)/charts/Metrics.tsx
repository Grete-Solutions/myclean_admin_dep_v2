'use client'

import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Banknote, 
  CalendarClock, 
  CreditCard, 
  Trash2, 
  Truck, 
  Users, 
  Wallet 
} from 'lucide-react';

// Types
interface DashboardData {
  counts: {
    approvedUsers: number;
    drivers: number;
    totalUsers: number;
    totalDriverBalance: number;
    completedPayments: number;
    pendingPayments: number;
    totalMonthlyPayments: number;
  };
}

interface MetricCardProps {
  title: string;
  value: number;
  formattedValue?: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  useCountUp?: boolean;
  prefix?: string;
  suffix?: string;
}

// Components
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  formattedValue, 
  change, 
  isPositive, 
  icon, 
  subtitle,
  useCountUp = true,
  prefix = '',
  suffix = ''
}) => {
  const shouldShowDecimals = title.includes('Rate') || title.includes('Time') || title.includes('Balance');
  
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-500 text-sm font-medium">{title}</div>
          <div className="bg-gray-100 rounded-full p-2">{icon}</div>
        </div>
        <div className="flex flex-col">
          {useCountUp ? (
            <span className="text-2xl font-bold">
              {prefix}
              <CountUp 
                end={value} 
                duration={2} 
                separator="," 
                decimal="."
                decimals={shouldShowDecimals ? 2 : 0}
              />
              {suffix}
            </span>
          ) : (
            <span className="text-2xl font-bold">{formattedValue}</span>
          )}
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

// Loading and Error States
const LoadingState = () => (
  <div className="p-6 flex justify-center items-center h-64">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
      <p>Loading dashboard data...</p>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 flex justify-center items-center h-64">
    <div className="flex items-center text-red-500">
      <AlertTriangle className="mr-2" />
      <p>{message}</p>
    </div>
  </div>
);

// Main Dashboard Component
const WasteManagementDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/GET/getCounts');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError('Error loading dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  // Calculate additional metrics (in a real app, these would come from the API)
  const wasteCollected = 845;
  const onTimeRate = 94.3;
  const complaints = 18;

  // Organized metrics for better maintenance
  const primaryMetrics = [
    {
      title: "Total Customers",
      value: dashboardData?.counts.approvedUsers || 0,
      subtitle: "Active accounts",
      change: "+2.8%",
      isPositive: true,
      icon: <Users size={18} />
    },
    {
      title: "Active Drivers",
      value: dashboardData?.counts.drivers || 0,
      subtitle: "94% availability",
      change: "+1",
      isPositive: true,
      icon: <Truck size={18} />
    },
    {
      title: "Waste Collected",
      value: wasteCollected,
      subtitle: "22% recyclables",
      change: "+1.7%",
      isPositive: true,
      icon: <Trash2 size={18} />,
      suffix: " tons"
    }
  ];

  const secondaryMetrics = [
    {
      title: "On-Time Collections",
      value: onTimeRate,
      change: "-0.8%",
      isPositive: false,
      icon: <CalendarClock size={18} />,
      suffix: "%"
    },
    {
      title: "Customer Complaints",
      value: complaints,
      change: "-25%",
      isPositive: true,
      icon: <AlertTriangle size={18} />
    },
    {
      title: "Driver Balance",
      value: dashboardData?.counts.totalDriverBalance || 0,
      change: "+3.5%",
      isPositive: true,
      icon: <Wallet size={18} />,
      prefix: "GH₵"
    }
  ];

  const paymentMetrics = [
    {
      title: "Monthly Payments",
      value: dashboardData?.counts.totalMonthlyPayments || 0,
      change: "+5.2%",
      isPositive: true,
      icon: <CreditCard size={18} />,
      prefix: "GH₵"
    },
    {
      title: "Completed Payments",
      value: dashboardData?.counts.completedPayments || 0,
      change: "+3.7%",
      isPositive: true,
      icon: <Banknote size={18} />,
      prefix: "GH₵"
    },
    {
      title: "Pending Payments",
      value: dashboardData?.counts.pendingPayments || 0,
      change: "-2.4%",
      isPositive: true,
      icon: <CreditCard size={18} />,
      prefix: "GH₵"
    }
  ];

  return (
    <div className="p-6 min-h-full">
      {/* Main Metrics */}
      <h2 className="text-lg font-semibold mb-3">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {primaryMetrics.map((metric, index) => (
          <MetricCard key={`primary-${index}`} {...metric} />
        ))}
      </div>
      
      {/* Secondary Metrics */}
      <h2 className="text-lg font-semibold mb-3">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {secondaryMetrics.map((metric, index) => (
          <MetricCard key={`secondary-${index}`} {...metric} />
        ))}
      </div>
      
      {/* Payment Metrics */}
      <h2 className="text-lg font-semibold mb-3">Payment Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMetrics.map((metric, index) => (
          <MetricCard key={`payment-${index}`} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default WasteManagementDashboard;