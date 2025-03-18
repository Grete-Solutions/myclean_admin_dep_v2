'use client'
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, BarChart3, CalendarClock, Trash2, Truck, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

// Interface for the data structure
interface DashboardData {
  counts: {
    approvedUsers: number;
    drivers: number;
    totalUsers: number;
    totalDriverBalance: number;
  };
}

// Interface for metric cards
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

// Card component for metric cards
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
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="bg-gray-100 rounded-full p-2">{icon}</div>
        </div>
        <div className="flex flex-col">
          {useCountUp ? (
            <span className="text-2xl font-bold">
              {prefix}
              <CountUp 
                end={value} 
                duration={2.5} 
                separator="," 
                decimal="."
                decimals={title.includes('Rate') || title.includes('Time') || title.includes('Balance') ? 2 : 0}
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

  if (isLoading) {
    return <div className="p-6 flex justify-center">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Calculate additional metrics (in a real app, these would come from the API)
  const wasteCollected = 845;
  const recyclingRate = 22.4;
  const onTimeRate = 94.3;
  const complaints = 18;
  const monthlyRevenue = 54280;

  return (
    <div className="p-6 min-h-full">
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Total Customers" 
          value={dashboardData?.counts.approvedUsers || 0} 
          subtitle="Active accounts"
          change="+2.8%" 
          isPositive={true} 
          icon={<Users size={18} />}
        />
        <MetricCard 
          title="Active Drivers" 
          value={dashboardData?.counts.drivers || 0} 
          subtitle="94% availability"
          change="+1" 
          isPositive={true}
          icon={<Truck size={18} />} 
        />
        <MetricCard 
          title="Monthly Revenue" 
          value={monthlyRevenue} 
          subtitle="GH₵ 985 avg per route"
          change="+4.2%" 
          isPositive={true}
          icon={<Banknote />}
          prefix="GH₵"
        />
        <MetricCard 
          title="Waste Collected" 
          value={wasteCollected} 
          subtitle="22% recyclables"
          change="+1.7%" 
          isPositive={true}
          icon={<Trash2 size={18} />}
          suffix=" tons"
        />
      </div>
      
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="On-Time Collections" 
          value={onTimeRate} 
          change="-0.8%" 
          isPositive={false} 
          icon={<CalendarClock size={18} />}
          suffix="%"
        />
        <MetricCard 
          title="Customer Complaints" 
          value={complaints} 
          change="-25%" 
          isPositive={true}
          icon={<AlertTriangle size={18} />} 
        />
        <MetricCard 
          title="Recycling Rate" 
          value={recyclingRate} 
          change="+1.2%" 
          isPositive={true}
          icon={<BarChart3 size={18} />}
          suffix="%"
        />
        <MetricCard 
          title="Driver Balance" 
          value={dashboardData?.counts.totalDriverBalance || 0} 
          change="+3.5%" 
          isPositive={true}
          icon={<Wallet size={18} />}
          prefix="GH₵"
          suffix=""
        />
      </div>
    </div>
  );
};

export default WasteManagementDashboard;