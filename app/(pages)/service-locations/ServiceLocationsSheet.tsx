import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ServiceLocation {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
  coordinates: [number, number][];
}

interface ErrorResponse {
  message: string;
}

const worldBounds: [number, number][][] = [
  [
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180],
  ],
];

function ServiceLocationsSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [formData, setFormData] = useState<ServiceLocation>({
    city: '',
    price: 0,
    isActive: false,
    countryISOCode: '',
    commission: 0,
    coordinates: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/GET/serviceLocations')
      .then(response => response.json())
      .then(data => setServiceLocations(data))
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'commission' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/POST/postServiceLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.message || 'Failed to create service location');
      }

      await response.json();
      toast.success('Service location created successfully');
      setIsOpen(false);
      setFormData({
        city: '',
        price: 0,
        isActive: false,
        countryISOCode: '',
        commission: 0,
        coordinates: [],
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">Manage Service Areas</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Service Areas</SheetTitle>
            <SheetDescription>View and add service locations.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryISOCode">Country ISO Code</Label>
              <Input id="countryISOCode" name="countryISOCode" value={formData.countryISOCode} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Commission</Label>
                <Input id="commission" name="commission" type="number" value={formData.commission} onChange={handleChange} required />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Service Location'}</Button>
            </SheetFooter>
          </form>
          <div className="w-full h-96 rounded-md overflow-hidden mt-4">
            <MapContainer center={[0, 0]} zoom={2} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {serviceLocations.map((location, index) => (
                location.isActive && (
                  <Polygon
                    key={index}
                    positions={location.coordinates}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.4 }}
                  />
                )
              ))}
              <Polygon positions={worldBounds} pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.6 }} />
            </MapContainer>
          </div>
          <SheetFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ServiceLocationsSheet;