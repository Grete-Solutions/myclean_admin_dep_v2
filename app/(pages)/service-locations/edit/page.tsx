/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, MapPin, X, Plus } from "lucide-react"
import { toast } from "sonner"
import EditMapSheet from "./editmap"

type Bin = {
  binType: string
  capacity: number
  price: number
  equivalentBags: string
  isActive: boolean
  imageUrl: string
}

type ServiceLocation = {
  id: string
  city: string
  price: number
  isActive: boolean
  countryISOCode: string
  commission: number
  coordinates: { _latitude: number; _longitude: number }[] // Backend response format
  bins?: Bin[]
  radius?: number
  createdAt: {
    _seconds: number
    _nanoseconds: number
  }
  isDeleted: boolean
  updatedAt: {
    _seconds: number
    _nanoseconds: number
  }
}

export default function EditServiceLocationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("id")

  const [service, setService] = React.useState<ServiceLocation | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [saving, setSaving] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isMapSheetOpen, setIsMapSheetOpen] = React.useState(false)

  const [formData, setFormData] = React.useState<{
    city: string
    price: number
    isActive: boolean
    countryISOCode: string
    commission: number
    radius: number
    coordinates: [number, number][] // Frontend uses [number, number][]
    bins: Bin[]
  }>({
    city: "",
    price: 0,
    isActive: true,
    countryISOCode: "",
    commission: 0,
    radius: 0,
    coordinates: [],
    bins: [],
  })

  // Add new bin
  const addBin = () => {
    const newBin: Bin = {
      binType: "",
      capacity: 0,
      price: 0,
      equivalentBags: "",
      isActive: true,
      imageUrl: "",
    }
    setFormData((prev) => ({
      ...prev,
      bins: [...prev.bins, newBin],
    }))
  }

  // Remove bin
  const removeBin = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bins: prev.bins.filter((_, i) => i !== index),
    }))
  }

  // Update bin
  const updateBin = (index: number, field: keyof Bin, value: any) => {
    setFormData((prev) => {
      const updatedBins = [...prev.bins]
      updatedBins[index] = { ...updatedBins[index], [field]: value }
      return { ...prev, bins: updatedBins }
    })
  }

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

        {formData.bins.length === 0 && (
          <p className="text-sm text-gray-500">No bins added yet. Click Add Bin to get started.</p>
        )}

        {formData.bins.map((bin, index) => (
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
                  <Label className="text-sm font-medium">Bin Type</Label>
                  <Input
                    placeholder="e.g., mini, standard"
                    value={bin.binType}
                    onChange={(e) => updateBin(index, "binType", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Capacity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={bin.capacity}
                    onChange={(e) => updateBin(index, "capacity", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={bin.price}
                    onChange={(e) => updateBin(index, "price", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={bin.isActive} onCheckedChange={(checked) => updateBin(index, "isActive", checked)} />
                  <Label className="text-sm font-medium">Active</Label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Equivalent Bags</Label>
                <Input
                  placeholder="e.g., Equivalent to 2 extra-large polythene bags"
                  value={bin.equivalentBags}
                  onChange={(e) => updateBin(index, "equivalentBags", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Image URL</Label>
                <Input
                  placeholder="https://example.com/images/bin.jpg"
                  value={bin.imageUrl}
                  onChange={(e) => updateBin(index, "imageUrl", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

// Fixed handleSubmit function with correct coordinate format
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  console.log("🔍 Form submission started")
  console.log("📋 Form data:", formData)
  console.log("🆔 Service ID:", serviceId)

  // Validation
  if (!formData.city.trim()) {
    toast.error("City is required")
    return
  }

  if (!formData.countryISOCode.trim()) {
    toast.error("Country ISO Code is required")
    return
  }

  if (formData.price <= 0) {
    toast.error("Price must be greater than 0")
    return
  }

  // Basic validation for bins
  if (formData.bins.length === 0) {
    toast.error("Please add at least one bin type.")
    return
  }

  for (const [index, bin] of formData.bins.entries()) {
    if (!bin.binType.trim()) {
      toast.error(`Bin ${index + 1}: Bin type is required`)
      return
    }
    if (!bin.capacity || bin.capacity <= 0) {
      toast.error(`Bin ${index + 1}: Capacity must be greater than 0`)
      return
    }
    if (!bin.price || bin.price <= 0) {
      toast.error(`Bin ${index + 1}: Price must be greater than 0`)
      return
    }
    if (!bin.equivalentBags.trim()) {
      toast.error(`Bin ${index + 1}: Equivalent bags description is required`)
      return
    }
  }

  // Validate coordinates - API expects at least 3 points
  if (formData.coordinates.length < 3) {
    toast.error("Please define a service area with at least 3 coordinate points")
    return
  }

  if (!serviceId) {
    toast.error("Service ID is missing")
    return
  }

  // ✅ FIXED: Send coordinates as [number, number][] format (what API expects)
  // NOT as objects with _latitude and _longitude properties
  const payload = {
    city: formData.city,
    price: formData.price,
    isActive: formData.isActive,
    countryISOCode: formData.countryISOCode,
    commission: formData.commission,
    radius: formData.radius,
    coordinates: formData.coordinates, // Send as [number, number][] directly
    bins: formData.bins,
  }

  try {
    setSaving(true)
    console.log("📤 Sending to:", `/api/PUT/serviceLocation?id=${serviceId}`)
    console.log("📤 Payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(`/api/PUT/serviceLocation?id=${serviceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📨 Response status:", response.status)
    console.log("📨 Response ok:", response.ok)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("❌ Error response:", errorData)
      throw new Error(errorData.error || errorData.message || `Failed to update service location: ${response.status}`)
    }
    
    const result = await response.json()
    console.log("✅ Update success:", result)

    toast.success("Service location updated successfully")
    router.push("/service-locations")
  } catch (error) {
    console.error("💥 Error updating service location:", error)
    toast.error(`Failed to update service location: ${(error as Error).message}`)
  } finally {
    setSaving(false)
  }
}

// Also need to fix the coordinate transformation when fetching data
const fetchService = async () => {
  try {
    const response = await fetch(`/api/GET/locations/locationsbyId?id=${serviceId}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`)
    }
    const data = await response.json()
    const serviceData: ServiceLocation = data.data[0]

    // ✅ FIXED: Transform coordinates from backend format to frontend format
    // Backend sends objects with _latitude and _longitude
    // Frontend needs [number, number][] format
    const transformedCoordinates: [number, number][] =
      serviceData.coordinates?.map((coord) => [coord._latitude, coord._longitude]) || []

    setService(serviceData)
    setFormData({
      city: serviceData.city || "",
      price: serviceData.price || 0,
      isActive: serviceData.isActive ?? true,
      countryISOCode: serviceData.countryISOCode || "",
      commission: serviceData.commission || 0,
      radius: serviceData.radius || 0,
      coordinates: transformedCoordinates, // This is correct
      bins: serviceData.bins || [],
    })
  } catch (error) {
    console.error("Error fetching service:", error)
    setError((error as Error).message)
  } finally {
    setLoading(false)
  }
}

  // Handle input changes
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle back navigation
  const handleBack = () => {
    router.push("/service-locations")
  }

  // Handle map save from the sheet
  const handleMapSave = (updatedMapCoordinates: [number, number][]) => {
    console.log("Map coordinates updated:", updatedMapCoordinates)
    setFormData((prev) => ({
      ...prev,
      coordinates: updatedMapCoordinates,
    }))
    setIsMapSheetOpen(false)
  }

  // Clear coordinates
  const handleClearCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      coordinates: [],
    }))
    toast.success("Coordinates cleared")
  }

  React.useEffect(() => {
    if (serviceId) {
      fetchService()
    } else {
      setError("No service ID provided")
      setLoading(false)
    }
  }, [serviceId])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service Locations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Service Location Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The requested service location could not be found.</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service Locations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button onClick={handleBack} variant="outline" className="mr-4 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Service Location</h1>
            <p className="text-muted-foreground">Update details for {service.city}</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Service Location Details</CardTitle>
            <CardDescription>Modify the service location information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryISOCode">Country ISO Code *</Label>
                  <Input
                    id="countryISOCode"
                    value={formData.countryISOCode}
                    onChange={(e) => handleInputChange("countryISOCode", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission">Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.commission}
                    onChange={(e) => handleInputChange("commission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.radius}
                    onChange={(e) => handleInputChange("radius", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <BinManager />

              <div className="space-y-4">
                <Label>Service Area Map</Label>
                <div className="h-40 w-full border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  {formData.coordinates && formData.coordinates.length > 0 ? (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">
                        Service area defined with {formData.coordinates.length} points
                      </p>
                      <p className="text-sm text-gray-500">
                        Coordinates: {formData.coordinates.slice(0, 2).map(coord => 
                          `[${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]`
                        ).join(', ')}
                        {formData.coordinates.length > 2 && '...'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No service area defined</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsMapSheetOpen(true)}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {formData.coordinates.length > 0 ? "Edit Service Area" : "Define Service Area"}
                  </Button>
                  {formData.coordinates.length > 0 && (
                    <Button type="button" variant="outline" onClick={handleClearCoordinates}>
                      <X className="mr-2 h-4 w-4" />
                      Clear Area
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <EditMapSheet
        isOpen={isMapSheetOpen}
        onOpenChange={setIsMapSheetOpen}
        initialCoordinates={formData.coordinates}
        onSave={handleMapSave}
      />
    </div>
  )
}