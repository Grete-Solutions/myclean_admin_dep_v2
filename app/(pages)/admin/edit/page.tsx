"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AdminFormData = {
  name: string;
  email: string;
  role: string;
  displayName: string;
  address: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDeactivated: boolean;
  isSuspended: boolean;
  failedAttempts: number;
};

type ApiError = {
  message: string;
  status?: number;
};

function AdminEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminId = searchParams.get("id");

  const { register, handleSubmit, setValue } = useForm<AdminFormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (adminId) {
      setIsLoading(true);
      fetch(`/api/GET/admin-auth/adminbyId?id=${adminId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch admin: ${res.status}`);
          }
          return res.json();
        })
        .then((response) => {
          const data = response.data?.[0]; // Extract from data array
          if (!data) {
            toast.error("Admin not found");
            setError({ message: "Admin not found", status: 404 });
            return;
          }

          setValue("name", data.name);
          setValue("email", data.email);
          setValue("role", data.role);
          setValue("displayName", data.displayName);
          setValue("address", data.address);
          setValue("country", data.country);
          setValue("city", data.city);
          setValue("state", data.state);
          setValue("postalCode", data.postalCode);
          setValue("phone", data.phone);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError({ message: "Failed to load admin details" });
          toast.error("Failed to load admin details");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setError({ message: "No admin ID provided" });
    }
  }, [adminId, setValue]);

  const onSubmit = async (data: AdminFormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/PUT/admin?id=${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }), // Wrap in `data`
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update admin");
      }

      toast.success("Admin updated successfully");
      router.push("/admin");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
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
            <Button onClick={() => router.push("/admin")}>Return to Admin List</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Edit Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} required />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" {...register("displayName")} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register("role")} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} required />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} required />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} required />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} required />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" {...register("postalCode")} required />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Admin"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminEdit() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <AdminEditForm />
      </Suspense>
    </div>
  );
}