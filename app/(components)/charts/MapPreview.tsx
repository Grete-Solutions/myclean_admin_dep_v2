'use client'
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

export const MapPreviewCard = () => {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">Map Preview</CardTitle>
          <div className="flex space-x-2">
            <button className="p-1">
              <span className="sr-only">Download</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <button className="p-1">
              <span className="sr-only">More</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
          </div>
        </div>
        <CardContent className="p-4 flex justify-center">
          <div className="relative bg-gray-200 rounded-md h-64 w-full flex items-center justify-center">
            <Map className="h-16 w-16 text-gray-400" />
            <div className="absolute top-1/3 right-1/4 bg-white p-2 rounded-md shadow-md">
              <div className="text-lg font-bold">$13.26M</div>
              <div className="text-sm text-gray-500">Greater Accra</div>
            </div>
            <div className="absolute bottom-2 right-2">
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-1"></span>
                  <span>&lt;60%</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                  <span>&lt;40%</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span>
                  <span>&lt;20%</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="h-2 w-2 bg-gray-500 rounded-full mr-1"></span>
                  <span>&gt;5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
};