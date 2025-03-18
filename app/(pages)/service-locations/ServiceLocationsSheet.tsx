'use client'
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';

// Define the types for the service location
interface ServiceLocation {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
  coordinates: [number, number][];
}

// Define the form values type
interface ServiceLocationFormValues {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
}

// Dynamically import the map components with no SSR
const MapWithNoSSR = dynamic(
  () => import('./MapComponent').then((mod) => mod.MapComponent),
  { ssr: false }
);

// Main component
const ServiceLocationSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [activePolygons, setActivePolygons] = useState<[number, number][][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Ghana's center coordinates
  const ghanaCenterLat = 7.9465;
  const ghanaCenterLng = -1.0232;

  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ServiceLocationFormValues>({
    defaultValues: {
      city: '',
      price: 0,
      isActive: true,
      countryISOCode: 'GH', // Ghana's ISO code
      commission: 0,
    },
  });

  async function onSubmit(data: ServiceLocationFormValues) {
    if (activePolygons.length === 0) {
      alert('Please define at least one service area on the map');
      return;
    }

    setIsSubmitting(true);
    
    // Create service locations for each defined polygon
    const serviceLocations: ServiceLocation[] = activePolygons.map(polygon => ({
      ...data,
      coordinates: polygon
    }));

    try {
      // Send each service location to the API
      for (const location of serviceLocations) {
        await fetch('/api/POST/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(location),
        });
      }
      
      // Reset form and close sheet on success
      form.reset();
      setCoordinates([]);
      setActivePolygons([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting service location:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Component to display coordinates
  const CoordinateDisplay: React.FC<{
    coordinates: [number, number][];
    activePolygons: [number, number][][];
  }> = ({ coordinates, activePolygons }) => {
    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-2">Coordinate Points</h3>
        
        {coordinates.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Current Points:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              {coordinates.map((coord, idx) => (
                <div key={idx} className="text-sm p-1 bg-gray-100 rounded">
                  Point {idx + 1}: [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activePolygons.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700">Completed Polygons:</p>
            <div className="mt-1">
              {activePolygons.map((polygon, polyIdx) => (
                <div key={polyIdx} className="mb-2">
                  <p className="text-sm text-gray-600">Polygon {polyIdx + 1} ({polygon.length} points):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 mt-1">
                    {polygon.map((coord, idx) => (
                      <div key={idx} className="text-sm p-1 bg-gray-100 rounded">
                        Point {idx + 1}: [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Add Service Location</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg p-5 lg:max-w-xl overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Add Service Location</SheetTitle>
          <SheetDescription>
            Define service areas in Ghana by drawing polygons on the map.
            Left-click to add points, right-click to complete a polygon.
            Define at least one area with minimum 3 points.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Accra, Kumasi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="countryISOCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country ISO Code</FormLabel>
                      <FormControl>
                        <Input placeholder="GH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Make this service location active immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="h-64 md:h-80 border rounded-lg overflow-hidden">
                {isClient && (
                  <MapWithNoSSR 
                    center={[ghanaCenterLat, ghanaCenterLng]} 
                    zoom={7}
                    coordinates={coordinates}
                    setCoordinates={setCoordinates}
                    activePolygons={activePolygons}
                    setActivePolygons={setActivePolygons}
                  />
                )}
              </div>
              
              <CoordinateDisplay 
                coordinates={coordinates} 
                activePolygons={activePolygons} 
              />
              
              <div className="flex justify-between gap-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => {
                    if (coordinates.length > 0) {
                      setCoordinates([]);
                    } else if (activePolygons.length > 0) {
                      setActivePolygons(activePolygons.slice(0, -1));
                    }
                  }}
                >
                  {coordinates.length > 0 ? "Clear Current Points" : "Remove Last Polygon"}
                </Button>
                <div className="space-x-2">
                  <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || activePolygons.length === 0}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
        <SheetFooter className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Defined areas: {activePolygons.length} 
              {activePolygons.length > 0 ? 
                ` (${activePolygons.length < 3 ? 'minimum 3 recommended' : 'sufficient'})` : 
                ' (none defined yet)'}
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceLocationSheet;