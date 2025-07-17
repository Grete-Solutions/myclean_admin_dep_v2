/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';

// Define the bin type interface
interface BinType {
  binType: string;
  capacity: number;
  price: number;
  equivalentBags: string;
  isActive: boolean;
  imageUrl: string;
}

// Define the types for the service location
interface ServiceLocation {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
  coordinates: [number, number][];
  bins: BinType[];
  radius: number;
}

// Define the form values type
interface ServiceLocationFormValues {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
  radius: number;
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
  const [bins, setBins] = useState<BinType[]>([]);
  
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
      radius: 0,
    },
  });

  // Add new bin
  const addBin = () => {
    const newBin: BinType = {
      binType: '',
      capacity: 0,
      price: 0,
      equivalentBags: '',
      isActive: true,
      imageUrl: ''
    };
    setBins([...bins, newBin]);
  };

  // Remove bin
  const removeBin = (index: number) => {
    setBins(bins.filter((_, i) => i !== index));
  };

  // Update bin
  const updateBin = (index: number, field: keyof BinType, value: any) => {
    const updatedBins = [...bins];
    updatedBins[index] = { ...updatedBins[index], [field]: value };
    setBins(updatedBins);
  };

  async function onSubmit(data: ServiceLocationFormValues) {
    if (activePolygons.length === 0) {
      alert('Please define at least one service area on the map');
      return;
    }

    if (bins.length === 0) {
      alert('Please add at least one bin type');
      return;
    }

    // Validate bins
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      if (!bin.binType || !bin.capacity || !bin.price || !bin.equivalentBags) {
        alert(`Please fill in all required fields for bin ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);

    // Create service locations for each defined polygon
    const serviceLocations: ServiceLocation[] = activePolygons.map(polygon => ({
      city: data.city,
      price: data.price,
      isActive: data.isActive,
      countryISOCode: data.countryISOCode,
      commission: data.commission,
      bins: bins,
      radius: data.radius,
      coordinates: polygon
    }));

    try {
      // Send each service location to the API
      for (const location of serviceLocations) {
        await fetch('/api/POST/postServiceLocation', {
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
      setBins([]);
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

  // Component to manage bins
  const BinManager: React.FC = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Bin Types</h3>
          <Button type="button" onClick={addBin} size="sm" className="flex items-center gap-1">
            <Plus size={16} />
            Add Bin
          </Button>
        </div>
        
        {bins.length === 0 && (
          <p className="text-sm text-gray-500">No bins added yet. Click Add Bin to get started.</p>
        )}
        
        {bins.map((bin, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Bin {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBin(index)}
                  className="h-6 w-6 p-0"
                >
                  <X size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Bin Type</label>
                  <Input
                    placeholder="e.g., mini, standard"
                    value={bin.binType}
                    onChange={(e) => updateBin(index, 'binType', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={bin.capacity}
                    onChange={(e) => updateBin(index, 'capacity', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={bin.price}
                    onChange={(e) => updateBin(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={bin.isActive}
                    onCheckedChange={(checked) => updateBin(index, 'isActive', checked)}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Equivalent Bags</label>
                <Input
                  placeholder="e.g., Equivalent to 2 extra-large polythene bags"
                  value={bin.equivalentBags}
                  onChange={(e) => updateBin(index, 'equivalentBags', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  placeholder="https://example.com/images/bin.jpg"
                  value={bin.imageUrl}
                  onChange={(e) => updateBin(index, 'imageUrl', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
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
                name="radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Radius (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Service radius in kilometers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <BinManager />
              
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
                    disabled={isSubmitting || activePolygons.length === 0 || bins.length === 0}
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
              Defined areas: {activePolygons.length} | Bins: {bins.length}
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