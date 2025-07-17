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
}> = ({ coordinates, activePolygons }) => {
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
                <p className="text-sm text-gray-600">
                  Polygon {polyIdx + 1} ({polygon.length} points):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 mt-1">
                  {polygon.map((coord, idx) => (
                    <div key={idx} className="text-sm p-1 bg-green-100 rounded">
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
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Ghana's center coordinates
  const ghanaCenterLat = 7.9465
  const ghanaCenterLng = -1.0232

  // Initialize the map state when sheet opens
  React.useEffect(() => {
    if (isOpen && !hasInitialized) {
      console.log("Initializing map with coordinates:", initialCoordinates)
      setCoordinates([]) // Clear any current drawing
      setActivePolygons(initialCoordinates.length > 0 ? [initialCoordinates] : [])
      setHasInitialized(true)
    } else if (!isOpen) {
      setHasInitialized(false)
    }
  }, [isOpen, initialCoordinates, hasInitialized])

  const handleSave = () => {
    // If there are active drawing points, complete them into a polygon
    let finalPolygons = [...activePolygons]
    
    if (coordinates.length > 0) {
      if (coordinates.length >= 3) {
        finalPolygons = [...activePolygons, coordinates]
      } else {
        alert("Current drawing has less than 3 points and will not be saved as a polygon.")
      }
    }

    console.log("Saving polygons:", finalPolygons)
    
    // Pass back the first (or only) polygon, or empty array if none
    const polygonToSave = finalPolygons.length > 0 ? finalPolygons[0] : []
    onSave(polygonToSave)
    
    // Reset state
    setCoordinates([])
    setActivePolygons([])
    setHasInitialized(false)
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
    setHasInitialized(false)
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
              center={[ghanaCenterLat, ghanaCenterLng]}
              zoom={7}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
              activePolygons={activePolygons}
              setActivePolygons={setActivePolygons}
            />
          </div>
          
          <CoordinateDisplay coordinates={coordinates} activePolygons={activePolygons} />
          
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