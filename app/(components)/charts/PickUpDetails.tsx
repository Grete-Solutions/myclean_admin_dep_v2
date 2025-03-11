'use client'
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Details Component

export const PickupDetails = () => {
  const areaData = [
    { name: '0', value1: 4, value2: 8, value3: 32, value4: 60, value5: 12 },
    { name: '1', value1: 5, value2: 10, value3: 28, value4: 55, value5: 14 },
    { name: '2', value1: 6, value2: 12, value3: 26, value4: 52, value5: 16 },
    { name: '3', value1: 7, value2: 14, value3: 24, value4: 48, value5: 18 },
    { name: '4', value1: 8, value2: 16, value3: 22, value4: 44, value5: 20 },
    { name: '5', value1: 4, value2: 18, value3: 21, value4: 42, value5: 22 },
    { name: '6', value1: 4, value2: 20, value3: 21, value4: 42, value5: 24 },
  ];
  
  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <CardTitle className="text-lg">Details</CardTitle>
        <button className="p-1">
          <span className="sr-only">More</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </button>
      </div>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-bold">27.8K</div>
            <div className="text-sm text-gray-500">Opened Request</div>
          </div>
          <div>
            <div className="text-2xl font-bold">67%</div>
            <div className="text-sm text-gray-500">Engaged</div>
          </div>
          <div>
            <div className="text-2xl font-bold">24%</div>
            <div className="text-sm text-gray-500">EOI Sent</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="colorValue3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip />
            <Area type="monotone" dataKey="value1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue3)" />
            <Area type="monotone" dataKey="value2" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue3)" />
            <Area type="monotone" dataKey="value3" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue3)" />
            <Area type="monotone" dataKey="value4" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue3)" />
            <Area type="monotone" dataKey="value5" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue3)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-between pt-2">
          <div className="text-center">
            <div className="text-sm font-medium">4%</div>
          </div>
          <div className="text-center">
            <div className="bg-black text-white px-2 py-1 rounded-full text-xs">32%</div>
            <div className="text-sm font-medium mt-1">21%</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">12%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
