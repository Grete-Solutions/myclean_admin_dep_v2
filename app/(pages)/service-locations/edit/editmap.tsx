"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import "leaflet/dist/leaflet.css"
import dynamic from "next/dynamic"

// Dynamically import the map components with no SSR
const MapWithNoSSR = dynamic(() => import("../MapComponent").then((mod) => mod.MapComponent), { ssr: false })

interface EditMapSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialCoordinates: [number, number][] // Expects a single polygon's coordinates
  onSave: (updatedCoordinates: [number, number][]) => void
}

// Component to display coordinates
const CoordinateDisplay: React.FC<{
  coordinates: [number, number][]
  activePolygons: [number, number][][]
  initialCoordinates: [number, number][]
}> = ({ coordinates, activePolygons, initialCoordinates }) => {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium mb-2">Coordinate Points</h3>
      {coordinates.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700">Current Drawing Points:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            {coordinates.map((coord, idx) => (
              <div key={idx} className="text-sm p-1 bg-blue-100 rounded">
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
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    polyIdx === 0 && initialCoordinates.length > 0 ? 'bg-blue-500' : 'bg-green-500'
                  }`}></span>
                  Polygon {polyIdx + 1} ({polygon.length} points)
                  {polyIdx === 0 && initialCoordinates.length > 0 && (
                    <span className="text-xs text-blue-600 font-medium">(Existing)</span>
                  )}
                  {polyIdx > 0 && (
                    <span className="text-xs text-green-600 font-medium">(New)</span>
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 mt-1">
                  {polygon.map((coord, idx) => (
                    <div key={idx} className={`text-sm p-1 rounded ${
                      polyIdx === 0 && initialCoordinates.length > 0 ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      Point {idx + 1}: [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {coordinates.length === 0 && activePolygons.length === 0 && (
        <p className="text-sm text-gray-500">No coordinates defined. Click on the map to start drawing.</p>
      )}
    </div>
  )
}

const EditMapSheet: React.FC<EditMapSheetProps> = ({ isOpen, onOpenChange, initialCoordinates, onSave }) => {
  const [coordinates, setCoordinates] = React.useState<[number, number][]>([])
  const [activePolygons, setActivePolygons] = React.useState<[number, number][][]>([])
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([7.9465, -1.0232]) // Default Ghana center
  const [mapZoom, setMapZoom] = React.useState<number>(7) // Default zoom

  // Ghana's center coordinates (fallback)
  const ghanaCenterLat = 7.9465
  const ghanaCenterLng = -1.0232

  // Function to calculate bounds of all polygons
  const calculateBounds = (polygons: [number, number][][]): [[number, number], [number, number]] | null => {
    if (polygons.length === 0) return null

    let minLat = Infinity
    let maxLat = -Infinity
    let minLng = Infinity
    let maxLng = -Infinity

    polygons.forEach(polygon => {
      polygon.forEach(([lat, lng]) => {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
      })
    })

    // Add some padding to the bounds
    const latPadding = (maxLat - minLat) * 0.1
    const lngPadding = (maxLng - minLng) * 0.1

    return [
      [minLat - latPadding, minLng - lngPadding],
      [maxLat + latPadding, maxLng + lngPadding]
    ]
  }

  // Function to calculate center and zoom from bounds
  const calculateCenterAndZoom = (bounds: [[number, number], [number, number]]): { center: [number, number], zoom: number } => {
    const [[minLat, minLng], [maxLat, maxLng]] = bounds

    // Calculate center
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    // Calculate zoom level based on bounds
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    // Rough zoom calculation (higher zoom = more zoomed in)
    let zoom = 10
    if (maxDiff > 10) zoom = 5
    else if (maxDiff > 5) zoom = 6
    else if (maxDiff > 2) zoom = 7
    else if (maxDiff > 1) zoom = 8
    else if (maxDiff > 0.5) zoom = 9
    else if (maxDiff > 0.2) zoom = 10
    else zoom = 12

    return { center: [centerLat, centerLng], zoom }
  }

  // Initialize the map state when sheet opens or coordinates change
  React.useEffect(() => {
    if (isOpen) {
      console.log("Initializing/updating map with coordinates:", initialCoordinates)
      setCoordinates([]) // Clear any current drawing
      // Preserve existing coordinates as active polygons
      const polygons = initialCoordinates.length > 0 ? [initialCoordinates] : []

      // Auto-zoom to polygons if they exist
      if (polygons.length > 0) {
        const bounds = calculateBounds(polygons)
        if (bounds) {
          const { center, zoom } = calculateCenterAndZoom(bounds)
          setMapCenter(center)
          setMapZoom(zoom)
          console.log("Auto-zooming to polygons:", { center, zoom, bounds })
        }
      } else {
        // Reset to default Ghana center if no polygons
        setMapCenter([ghanaCenterLat, ghanaCenterLng])
        setMapZoom(7)
      }

      setActivePolygons(polygons)
    }
  }, [isOpen, initialCoordinates])

  const handleSave = () => {
    // If there are active drawing points, complete them into a polygon
    let finalPolygons = [...activePolygons]

    if (coordinates.length > 0) {
      if (coordinates.length >= 3) {
        finalPolygons = [...activePolygons, coordinates]
      } else {
        alert("Current drawing has less than 3 points and will not be saved as a polygon.")
        return
      }
    }

    console.log("Saving polygons:", finalPolygons)

    // Handle multiple polygons - if we have both existing and new, use the newest one
    let polygonToSave: [number, number][] = []

    if (finalPolygons.length === 0) {
      // No polygons at all
      polygonToSave = []
    } else if (finalPolygons.length === 1) {
      // Only one polygon (either existing or new)
      polygonToSave = finalPolygons[0]
      console.log("Saving single polygon:", polygonToSave.length, "points")
    } else {
      // Multiple polygons - use the last one (newest drawing)
      // This preserves existing coordinates while allowing new drawings
      polygonToSave = finalPolygons[finalPolygons.length - 1]
      console.log("Multiple polygons found, saving the newest one:", polygonToSave.length, "points")
    }

    onSave(polygonToSave)

    // Reset state
    setCoordinates([])
    setActivePolygons([])
  }

  const handleClearOrRemove = () => {
    if (coordinates.length > 0) {
      // Clear current drawing points
      setCoordinates([])
      console.log("Cleared current drawing points")
    } else if (activePolygons.length > 0) {
      // Remove the last completed polygon
      const newPolygons = activePolygons.slice(0, -1)
      setActivePolygons(newPolygons)
      console.log("Removed last polygon, remaining:", newPolygons.length)
    }
  }

  const handleClearAll = () => {
    setCoordinates([])
    setActivePolygons([])
    console.log("Cleared all coordinates and polygons")
  }

  const handleCancel = () => {
    // Reset to initial state
    setCoordinates([])
    setActivePolygons(initialCoordinates.length > 0 ? [initialCoordinates] : [])
    onOpenChange(false)
  }

  const willBeSavedPolygon = React.useMemo(() => {
    let tempPolygons = [...activePolygons]
    if (coordinates.length >= 3) {
      tempPolygons = [...activePolygons, coordinates]
    }
    return tempPolygons.length > 0 ? tempPolygons[0] : []
  }, [coordinates, activePolygons])

  const canSave = willBeSavedPolygon.length >= 3

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg p-5 lg:max-w-xl overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Edit Service Area</SheetTitle>
          <SheetDescription>
            Define service areas by drawing polygons on the map. Left-click to add points, right-click to complete a
            polygon. Define at least one area with minimum 3 points.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="h-64 md:h-80 w-full border rounded-lg overflow-hidden">
            <MapWithNoSSR
              center={mapCenter}
              zoom={mapZoom}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
              activePolygons={activePolygons}
              setActivePolygons={setActivePolygons}
            />
          </div>
          
          <CoordinateDisplay coordinates={coordinates} activePolygons={activePolygons} initialCoordinates={initialCoordinates} />
          
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={handleClearOrRemove}
                disabled={coordinates.length === 0 && activePolygons.length === 0}
              >
                {coordinates.length > 0 ? "Clear Current" : "Remove Last"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleClearAll}
                disabled={coordinates.length === 0 && activePolygons.length === 0}
              >
                Clear All
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
        
        <SheetFooter className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Current drawing: {coordinates.length} points
            </p>
            <p className="text-sm text-gray-500">
              Completed polygons: {activePolygons.length}
            </p>
            {!canSave && (
              <p className="text-sm text-amber-600 mt-1">
                Need at least 3 points to save a polygon
              </p>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default EditMapSheet