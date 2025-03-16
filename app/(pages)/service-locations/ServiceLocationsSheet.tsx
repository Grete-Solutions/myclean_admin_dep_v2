import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the type based on the provided structure
type ServiceLocation = {
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number;
  coordinates: [number, number] | null; // Tuple for lat/lng, can be null if not selected
}

// MapSelector component using Leaflet
function MapSelector({ coordinates, onCoordinateChange }: {
  coordinates: [number, number] | null;
  onCoordinateChange: (coords: [number, number] | null) => void;
}) {
  // Center map at a neutral location if no selection has been made
  const defaultCenter: [number, number] = [20, 0]; // Approximately center of the world map
  const markerRef = useRef<L.Marker>(null);
  const mapRef = useRef<L.Map>(null);

  // Fix Leaflet marker icon issue
  useEffect(() => {
    // Cast to any to avoid TypeScript errors with internal Leaflet properties
    const DefaultIcon = L.Icon.Default as any;
    if (DefaultIcon.prototype._getIconUrl) {
      delete DefaultIcon.prototype._getIconUrl;
    }
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // MapEventHandler captures click events
  function MapEventHandler() {
    const map = useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onCoordinateChange([
          parseFloat(lat.toFixed(6)), 
          parseFloat(lng.toFixed(6))
        ]);
      },
    });
    
    // Store map reference
    mapRef.current = map;
    
    return null;
  }

  // If coordinates are cleared, center the map again
  useEffect(() => {
    if (!coordinates && mapRef.current) {
      mapRef.current.setView(defaultCenter, 2);
    }
  }, [coordinates]);

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="h-64 w-full relative">
        <MapContainer 
          center={coordinates || defaultCenter} 
          zoom={coordinates ? 10 : 2} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {coordinates && (
            <Marker 
              position={coordinates}
              draggable={true}
              ref={markerRef}
              eventHandlers={{
                dragend: () => {
                  const marker = markerRef.current;
                  if (marker) {
                    const position = marker.getLatLng();
                    onCoordinateChange([
                      parseFloat(position.lat.toFixed(6)), 
                      parseFloat(position.lng.toFixed(6))
                    ]);
                  }
                },
              }}
            />
          )}
          
          <MapEventHandler />
        </MapContainer>
        
        {!coordinates && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-sm font-medium text-center">
            Click on the map to select a location
          </div>
        )}
      </div>
      
      {/* Display selected coordinates or selection prompt */}
      <div className="mt-2 text-sm p-2">
        {coordinates ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Selected Location:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onCoordinateChange(null)}
                className="h-8 text-xs"
              >
                Clear Selection
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latDisplay">Latitude:</Label>
                <Input 
                  id="latDisplay" 
                  value={coordinates[0]} 
                  onChange={(e) => {
                    const newLat = parseFloat(e.target.value);
                    if (!isNaN(newLat)) {
                      onCoordinateChange([newLat, coordinates[1]]);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lngDisplay">Longitude:</Label>
                <Input 
                  id="lngDisplay" 
                  value={coordinates[1]} 
                  onChange={(e) => {
                    const newLng = parseFloat(e.target.value);
                    if (!isNaN(newLng)) {
                      onCoordinateChange([coordinates[0], newLng]);
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border border-dashed border-yellow-500 rounded-md bg-yellow-50">
            <p className="text-yellow-700">No location selected yet. Please click on the map.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceLocationsSheet() {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  
  const [newLocation, setNewLocation] = useState<ServiceLocation>({
    city: "",
    price: 0,
    isActive: true,
    countryISOCode: "",
    commission: 0,
    coordinates: null  // Start with no selection
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation({
      ...newLocation,
      [name]: name === "price" || name === "commission" ? Number(value) : value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewLocation({
      ...newLocation,
      isActive: checked
    });
  };

  const handleCoordinateChange = (newCoordinates: [number, number] | null) => {
    setNewLocation({
      ...newLocation,
      coordinates: newCoordinates
    });
  };

  const addLocation = async () => {
    try {
      // Validate inputs
      if (!newLocation.city || !newLocation.countryISOCode) {
        toast.error("City and Country code are required!");
        return;
      }

      // Validate coordinates
      if (!newLocation.coordinates) {
        toast.error("Please select a location on the map!");
        return;
      }

      // Simulating a POST request
      await postServiceLocation(newLocation);
      
      // Update the locations list
      setLocations([...locations, newLocation]);
      
      // Reset form and close sheet
      setNewLocation({
        city: "",
        price: 0,
        isActive: true,
        countryISOCode: "",
        commission: 0,
        coordinates: null // Reset to no selection
      });
      setOpen(false);
      
      // Show success toast
      toast.success(`Added ${newLocation.city} to service locations!`);
    } catch (error) {
      toast.error(`Failed to add location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Simulated POST function
  const postServiceLocation = async (locationData: ServiceLocation) => {
    // This would be your actual API call
    return new Promise<{ success: boolean; data: ServiceLocation }>((resolve) => {
      console.log("Posting location data:", locationData);
      // Simulate network delay
      setTimeout(() => {
        resolve({ success: true, data: locationData });
      }, 500);
    });
  };

  return (
    <div >
      
      <div className="mb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>Add Service Location</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Service Location</SheetTitle>
              <SheetDescription>
                Add a new city where your service is available. You must click on the map to select exact coordinates.
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={newLocation.city}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="countryISOCode" className="text-right">
                  Country Code
                </Label>
                <Input
                  id="countryISOCode"
                  name="countryISOCode"
                  value={newLocation.countryISOCode}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="US, UK, CA, etc."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newLocation.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commission" className="text-right">
                  Commission %
                </Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  value={newLocation.commission}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="map">
                  Location
                </Label>
                <div className="col-span-3">
                  <MapSelector 
                    coordinates={newLocation.coordinates} 
                    onCoordinateChange={handleCoordinateChange} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="isActive"
                    checked={newLocation.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </div>
            
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button 
                onClick={addLocation}
                disabled={!newLocation.coordinates}
              >
                Save Location
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{location.city}</h3>
                  <p className="text-sm text-gray-500">{location.countryISOCode}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Price:</span> ${location.price}
                </div>
                <div>
                  <span className="text-gray-500">Commission:</span> {location.commission}%
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Coordinates:</span> {location.coordinates?.[0]}, {location.coordinates?.[1]}
                </div>
              </div>
              {location.coordinates && (
                <div className="mt-2 h-32">
                  <MapContainer 
                    center={location.coordinates} 
                    zoom={10} 
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={location.coordinates} />
                  </MapContainer>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ServiceLocationsSheet;