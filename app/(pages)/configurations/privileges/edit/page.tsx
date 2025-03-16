"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Define Privilege Type
interface Privilege {
  name: string;
  country: string;
  city: string;
  description: string;
  slug: string;
  status: boolean;
  isDelete: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

function EditPrivilegeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const privilegeId = searchParams.get("id");

  const [privilege, setPrivilege] = useState<Privilege>({
    name: "",
    country: "",
    city: "",
    description: "",
    slug: "",
    status: false,
    isDelete: false,
  });

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (privilegeId) {
      setIsLoading(true);
      fetch(`/api/GET/privileges/privilegesbyId?id=${privilegeId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch privilege: ${res.status}`);
          }
          return res.json();
        })
        .then((response) => {
          const data = response.data;
          if (!data) {
            throw new Error("Privilege not found");
          }
          setPrivilege(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching privilege:", err);
          setError({ 
            message: err instanceof Error ? err.message : "Failed to load privilege details",
            status: err.status || 500
          });
          toast.error("Failed to load privilege details");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setError({ message: "No privilege ID provided", status: 400 });
    }
  }, [privilegeId]);

  // Handle text input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrivilege((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (name: keyof Privilege) => {
    setPrivilege((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/PUT/privileges/${privilegeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(privilege),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update privilege");
      }

      toast.success("Privilege updated successfully.");
      router.push("/privileges");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (error && !isLoading) {
    return (
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-red-500 mb-4">{error.message}</p>
            <Button onClick={() => router.push("/privileges")}>Return to Privileges List</Button>
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
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Edit Privilege</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input id="name" name="name" value={privilege.name} onChange={handleChange} placeholder="Name" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium">Country</label>
            <Input id="country" name="country" value={privilege.country} onChange={handleChange} placeholder="Country" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">City</label>
            <Input id="city" name="city" value={privilege.city} onChange={handleChange} placeholder="City" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" name="description" value={privilege.description} onChange={handleChange} placeholder="Description" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">Slug</label>
            <Input id="slug" name="slug" value={privilege.slug} onChange={handleChange} placeholder="Slug" />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="status" checked={privilege.status} onCheckedChange={() => handleCheckboxChange("status")} />
            <label htmlFor="status" className="text-sm font-medium">Active</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="isDelete" checked={privilege.isDelete} onCheckedChange={() => handleCheckboxChange("isDelete")} />
            <label htmlFor="isDelete" className="text-sm font-medium">Deleted</label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Privilege"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function EditPrivilegePage() {
  return (
    <div className="flex justify-center items-center p-6">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <EditPrivilegeForm />
      </Suspense>
    </div>
  );
}