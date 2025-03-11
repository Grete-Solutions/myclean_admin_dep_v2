'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CollectionEfficiencyTable = () => {
    const data = [
      { route: "North District", collections: 247, efficiency: "94%", status: "On Track" },
      { route: "Downtown", collections: 186, efficiency: "88%", status: "Delayed" },
      { route: "West Side", collections: 221, efficiency: "92%", status: "On Track" },
      { route: "East County", collections: 178, efficiency: "87%", status: "Delayed" },
      { route: "South District", collections: 259, efficiency: "96%", status: "On Track" },
    ];
  
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Collection Route Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Route</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Collections</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Efficiency</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 px-2">{row.route}</td>
                    <td className="py-2 px-2">{row.collections}</td>
                    <td className="py-2 px-2">{row.efficiency}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${row.status === "On Track" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };
  