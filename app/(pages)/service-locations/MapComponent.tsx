import React from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Tooltip, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

// Define types for coordinates and active polygons
type Coordinate = [number, number];

interface MapDrawerProps {
  coordinates: Coordinate[];
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinate[]>>;
  setActivePolygons: React.Dispatch<React.SetStateAction<Coordinate[][]>>;
}

// Component for drawing polygons on the map
const MapDrawer: React.FC<MapDrawerProps> = ({ coordinates, setCoordinates, setActivePolygons }) => {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      const newCoord: Coordinate = [e.latlng.lat, e.latlng.lng];
      setCoordinates((prev: Coordinate[]) => [...prev, newCoord]);
    },
    contextmenu: (e: LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      
      // Ensure we have at least 3 points for a polygon
      if (coordinates.length >= 3) {
        setActivePolygons((prev: Coordinate[][]) => [...prev, [...coordinates]]);
        setCoordinates([]);
      }
    },
  });

  return null;
};

interface MapComponentProps {
  center: Coordinate;
  zoom: number;
  coordinates: Coordinate[];
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinate[]>>;
  activePolygons: Coordinate[][];
  setActivePolygons: React.Dispatch<React.SetStateAction<Coordinate[][]>>;
}

// MapComponent that wraps all the Leaflet components
export const MapComponent: React.FC<MapComponentProps> = ({ 
  center, 
  zoom, 
  coordinates, 
  setCoordinates, 
  activePolygons, 
  setActivePolygons 
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Current polygon being drawn */}
      {coordinates.length > 1 && (
        <Polygon 
          positions={coordinates} 
          pathOptions={{ color: 'red', weight: 3 }}
        >
          <Tooltip permanent>
            Current polygon ({coordinates.length} points)
          </Tooltip>
        </Polygon>
      )}
      
      {/* Individual points of current polygon */}
      {coordinates.map((coord: Coordinate, idx: number) => (
        <Marker
          key={`current-${idx}`}
          position={coord}
        >
          <Tooltip permanent>
            Point {idx + 1}: [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
          </Tooltip>
        </Marker>
      ))}
      
      {/* Previously completed polygons */}
      {activePolygons.map((polygon: Coordinate[], polyIdx: number) => (
        <Polygon 
          key={polyIdx} 
          positions={polygon} 
          pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.3, weight: 3 }} 
        >
          <Tooltip permanent>
            Polygon {polyIdx + 1} ({polygon.length} points)
          </Tooltip>
        </Polygon>
      ))}
      
      <MapDrawer 
        coordinates={coordinates} 
        setCoordinates={setCoordinates} 
        setActivePolygons={setActivePolygons} 
      />
    </MapContainer>
  );
};