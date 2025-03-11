'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Sample revenue data for the chart
const revenueData = [
  { name: 'Jan', revenue: 42000 },
  { name: 'Feb', revenue: 45000 },
  { name: 'Mar', revenue: 47000 },
  { name: 'Apr', revenue: 44000 },
  { name: 'May', revenue: 48000 },
  { name: 'Jun', revenue: 51000 },
  { name: 'Jul', revenue: 54000 },
  { name: 'Aug', revenue: 52000 },
];
 export const RevenueChart = () => {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };
  