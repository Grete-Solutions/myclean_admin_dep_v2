'use client'

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VehicleMake {
  make: string;
  model: string;
  year: string;
  description: string;
  status: number;
  capacity: string;
}

interface ApiError {
  message: string;
  status?: number;
}

function EditVehicleMakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id");
  
  const [vehicle, setVehicle] = useState<VehicleMake>({
    make: "",
    model: "",
    year: "",
    description: "",
    status: 1,
    capacity: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError({ message: "No vehicle ID provided", status: 400 });
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/GET/vehicle-make/vehiclebyId?id=${vehicleId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.data || !data.data[0]) {
          throw new Error("Vehicle not found");
        }
        
        setVehicle(data.data[0]);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setError({ message: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicle();
  }, [vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/PUT/vehicleMake?id=${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicle),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update vehicle make");
      }
      
      toast.success("Vehicle make updated successfully");
      router.push("/vehicle-make");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError({ message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-red-500 mb-4">{error.message}</p>
            <Button onClick={() => router.push("/vehicle-make")}>Return to Vehicle Makes</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Edit Vehicle Make</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="make" className="text-sm font-medium">Make</label>
            <Input id="make" name="make" value={vehicle.make} onChange={handleChange} placeholder="Make" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="model" className="text-sm font-medium">Model</label>
            <Input id="model" name="model" value={vehicle.model} onChange={handleChange} placeholder="Model" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="year" className="text-sm font-medium">Year</label>
            <Input id="year" name="year" type="number" value={vehicle.year} onChange={handleChange} placeholder="Year" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input id="description" name="description" value={vehicle.description} onChange={handleChange} placeholder="Description" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="capacity" className="text-sm font-medium">Capacity</label>
            <Input id="capacity" name="capacity" type="number" value={vehicle.capacity} onChange={handleChange} placeholder="Capacity" required />
          </div>
          
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Vehicle Make"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function EditVehicleMake() {
  return (
    <div className="container mx-auto py-10 max-w-lg">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <EditVehicleMakeForm />
      </Suspense>
    </div>
  );
}