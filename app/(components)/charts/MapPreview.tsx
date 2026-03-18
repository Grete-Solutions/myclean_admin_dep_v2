import React, { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Users, UserCheck, UserX, Clock, Phone, Mail, Calendar, X, Navigation, ChevronRight } from "lucide-react"
import L from "leaflet"

// Import Leaflet CSS
const LEAFLET_CSS = `
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 6px;
  }
`

// Interface definitions
interface Timestamp {
  _seconds: number
  _nanoseconds: number
}

interface PickupLocation {
  _latitude: number
  _longitude: number
}

interface UserData {
  id: string
  country: string
  firstname: string
  city: string
  isDelete: boolean
  lastname: string
  createdAt: Timestamp
  isDisable: boolean
  referral: string
  phone: string
  referredBy: string
  userType: number
  email: string
  isSuspend: boolean
  updatedAt: Timestamp
  pickup_address: string
  profilePicture: string
  fcmToken: string
  pickup_location: PickupLocation
}

interface ApiResponse {
  success: boolean
  message: string
  status: number
  count: number
  data: UserData[]
}

interface GeocodedAddress {
  display_name: string
  address: {
    road?: string
    suburb?: string
    city?: string
    state?: string
    country?: string
  }
}

interface ServiceLocation {
  id: string
  city: string
  isActive: boolean
  coordinates?: { _latitude: number; _longitude: number }[]
}

// Reverse geocoding function — proxied through our API to avoid CORS and rate limits
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `/api/GET/geocode?lat=${lat}&lon=${lng}`,
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data: GeocodedAddress = await response.json()
    const { address } = data
    const parts = []

    if (address?.road) parts.push(address.road)
    if (address?.suburb) parts.push(address.suburb)
    if (address?.city) parts.push(address.city)
    if (address?.state) parts.push(address.state)

    return parts.length > 0 ? parts.join(", ") : data.display_name || "Location unavailable"
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return "Location unavailable"
  }
}

// Single map controller that handles initial fit and area navigation
const MapController = ({
  allUsers,
  flyTarget,
  focusKey,
}: {
  allUsers: UserData[]
  flyTarget: { center: [number, number]; zoom: number } | null
  focusKey: string | null
}) => {
  const map = useMap()
  const initialFitDone = React.useRef(false)

  // Initial fit to all markers on first render
  useEffect(() => {
    if (initialFitDone.current || allUsers.length === 0) return
    initialFitDone.current = true

    const bounds = L.latLngBounds(
      allUsers.map((u) => [u.pickup_location._latitude, u.pickup_location._longitude] as [number, number])
    )
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [allUsers, map])

  // Fly to area when flyTarget changes
  useEffect(() => {
    if (!flyTarget) return
    map.flyTo(flyTarget.center, flyTarget.zoom, { duration: 1.2 })
  }, [focusKey, flyTarget, map])

  return null
}

// Main Map Component
const MapComponent = ({
  users,
  onMarkerClick,
  geocodedAddresses,
  flyTarget,
  focusKey,
}: {
  users: UserData[]
  onMarkerClick: (user: UserData) => void
  geocodedAddresses: Record<string, string>
  flyTarget: { center: [number, number]; zoom: number } | null
  focusKey: string | null
}) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = LEAFLET_CSS
      document.head.appendChild(style)

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      link.onload = () => setIsReady(true)

      return () => {
        document.head.removeChild(style)
        document.head.removeChild(link)
      }
    }
  }, [])

  const validUsers = users.filter(
    (user) =>
      user.pickup_location &&
      user.pickup_location._latitude &&
      user.pickup_location._longitude &&
      !isNaN(user.pickup_location._latitude) &&
      !isNaN(user.pickup_location._longitude),
  )

  if (!isReady) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (validUsers.length === 0) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No valid locations to display</p>
        </div>
      </div>
    )
  }

  // Default center (Ghana)
  const ghanaCenter: [number, number] = [7.9465, -1.0232]

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={ghanaCenter}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Handles initial fit + area navigation */}
        <MapController allUsers={validUsers} flyTarget={flyTarget} focusKey={focusKey} />

        {validUsers.map((user) => {
          const displayAddress = geocodedAddresses[user.id] || user.pickup_address || "Loading location..."

          return (
            <Marker
              key={user.id}
              position={[user.pickup_location._latitude, user.pickup_location._longitude]}
              eventHandlers={{
                click: () => onMarkerClick(user),
              }}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <div className="font-semibold text-base mb-1">
                    {user.firstname} {user.lastname}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{displayAddress}</div>
                  <Badge
                    variant={user.isSuspend ? "destructive" : user.isDisable ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {user.isSuspend ? "Suspended" : user.isDisable ? "Disabled" : "Active"}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

// Area sidebar item
const AreaItem = ({
  area,
  isActive,
  onClick,
}: {
  area: ServiceLocation
  isActive: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group flex items-center justify-between ${
      isActive
        ? "bg-[#0A8791] text-white shadow-md"
        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
    }`}
  >
    <div className="flex items-center gap-2 min-w-0">
      <MapPin className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-[#0A8791]"}`} />
      <span className="text-sm font-medium truncate">{area.city}</span>
    </div>
    <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${isActive ? "text-white translate-x-0.5" : "text-gray-400 group-hover:translate-x-0.5"}`} />
  </button>
)

export const MapPreviewCard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<ApiResponse | null>(null)
  const [geocodedAddresses, setGeocodedAddresses] = useState<Record<string, string>>({})
  const [geocodingProgress, setGeocodingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  })
  const [activeAreaName, setActiveAreaName] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([])

  // Fetch activated service locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/GET/locations/locations")
        if (!response.ok) return
        const data = await response.json()
        // Only show active locations that have coordinates
        const active = (data.data || []).filter(
          (loc: ServiceLocation) => loc.isActive && loc.coordinates && loc.coordinates.length > 0
        )
        setServiceLocations(active)
      } catch (err) {
        console.error("Error fetching service locations:", err)
      }
    }
    fetchLocations()
  }, [])

  const handleAreaClick = useCallback((location: ServiceLocation) => {
    setActiveAreaName(location.city)

    if (location.coordinates && location.coordinates.length > 0) {
      // Compute center of the polygon coordinates
      const lats = location.coordinates.map((c) => c._latitude)
      const lngs = location.coordinates.map((c) => c._longitude)
      const centerLat = lats.reduce((sum, l) => sum + l, 0) / lats.length
      const centerLng = lngs.reduce((sum, l) => sum + l, 0) / lngs.length

      // Compute zoom based on polygon spread
      const latSpread = Math.max(...lats) - Math.min(...lats)
      const lngSpread = Math.max(...lngs) - Math.min(...lngs)
      const spread = Math.max(latSpread, lngSpread)

      let zoom = 14
      if (spread > 0.5) zoom = 10
      else if (spread > 0.1) zoom = 12
      else if (spread > 0.05) zoom = 13
      else if (spread > 0.01) zoom = 14
      else zoom = 15

      setFlyTarget({ center: [centerLat, centerLng], zoom })
      setFocusKey(`area-${location.city}-${Date.now()}`)
    }
  }, [])

  const geocodeUserLocations = useCallback(async (users: UserData[]) => {
    const validUsers = users.filter(
      (user) =>
        user.pickup_location &&
        user.pickup_location._latitude &&
        user.pickup_location._longitude &&
        !isNaN(user.pickup_location._latitude) &&
        !isNaN(user.pickup_location._longitude),
    )

    if (validUsers.length === 0) return

    setGeocodingProgress({ current: 0, total: validUsers.length })
    const addresses: Record<string, string> = {}

    // Process users one at a time to respect Nominatim rate limits
    for (let i = 0; i < validUsers.length; i++) {
      const user = validUsers[i]

      // If user already has a pickup_address, use it directly — no geocoding needed
      if (user.pickup_address && user.pickup_address.trim().length > 0) {
        addresses[user.id] = user.pickup_address
        setGeocodingProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      } else {
        try {
          const address = await reverseGeocode(user.pickup_location._latitude, user.pickup_location._longitude)
          addresses[user.id] = address
        } catch (error) {
          console.error(`Failed to geocode location for user ${user.id}:`, error)
          addresses[user.id] = "Location unavailable"
        }
        setGeocodingProgress((prev) => ({ ...prev, current: prev.current + 1 }))

        // Add delay between geocoding requests
        if (i < validUsers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      // Update state after each user
      setGeocodedAddresses((prev) => ({ ...prev, ...addresses }))
    }
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/GET/user-management/approvedUsers")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        setUserData(data)
        setError(null)

        if (data.data && data.data.length > 0) {
          geocodeUserLocations(data.data)
        }
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch users")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [geocodeUserLocations])

  const getStatistics = () => {
    if (!userData?.data) {
      return { total: 0, active: 0, disabled: 0, suspended: 0 }
    }

    const total = userData.data.length
    const active = userData.data.filter((user) => !user.isDisable && !user.isSuspend).length
    const disabled = userData.data.filter((user) => user.isDisable).length
    const suspended = userData.data.filter((user) => user.isSuspend).length

    return { total, active, disabled, suspended }
  }

  const stats = getStatistics()

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            User Pickup Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A8791] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            User Pickup Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <UserX className="h-12 w-12 mx-auto mb-2" />
              </div>
              <p className="text-red-600 font-medium">Error loading user data</p>
              <p className="text-gray-600 text-sm mt-1">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userData?.data || userData.data.length === 0) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            User Pickup Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No user data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#0A8791]" />
          User Pickup Locations
        </CardTitle>

        {geocodingProgress.total > 0 && geocodingProgress.current < geocodingProgress.total && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">
                Loading location names... ({geocodingProgress.current}/{geocodingProgress.total})
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Statistics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Total</span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-900">Active</span>
            </div>
            <p className="text-xl font-bold text-green-600 mt-0.5">{stats.active}</p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <UserX className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-900">Disabled</span>
            </div>
            <p className="text-xl font-bold text-gray-600 mt-0.5">{stats.disabled}</p>
          </div>
          <div className="bg-red-50 p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-red-600" />
              <span className="text-xs font-medium text-red-900">Suspended</span>
            </div>
            <p className="text-xl font-bold text-red-600 mt-0.5">{stats.suspended}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Map + Sidebar layout */}
        <div className="flex gap-4 h-[480px]">
          {/* Sidebar — Activated Areas */}
          <div className="w-56 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="h-4 w-4 text-[#0A8791]" />
              <h3 className="text-sm font-semibold text-gray-800">Activated Areas</h3>
              <Badge variant="secondary" className="text-xs ml-auto">{serviceLocations.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {/* "Show All" button */}
              <button
                onClick={() => {
                  setActiveAreaName(null)
                  // Zoom back to fit all user pins
                  const validUsers = (userData?.data || []).filter(
                    (u) => u.pickup_location && u.pickup_location._latitude && u.pickup_location._longitude
                  )
                  if (validUsers.length > 0) {
                    const lats = validUsers.map((u) => u.pickup_location._latitude)
                    const lngs = validUsers.map((u) => u.pickup_location._longitude)
                    const centerLat = lats.reduce((s, l) => s + l, 0) / lats.length
                    const centerLng = lngs.reduce((s, l) => s + l, 0) / lngs.length
                    setFlyTarget({ center: [centerLat, centerLng], zoom: 7 })
                    setFocusKey(`all-${Date.now()}`)
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeAreaName === null
                    ? "bg-[#0A8791] text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                }`}
              >
                <Users className={`h-4 w-4 flex-shrink-0 ${activeAreaName === null ? "text-white" : "text-[#0A8791]"}`} />
                <span className="text-sm font-medium">All Areas</span>
              </button>

              {serviceLocations.map((loc) => (
                <AreaItem
                  key={loc.id}
                  area={loc}
                  isActive={activeAreaName === loc.city}
                  onClick={() => handleAreaClick(loc)}
                />
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1">
            <MapComponent
              users={userData.data}
              onMarkerClick={setSelectedUser}
              geocodedAddresses={geocodedAddresses}
              flyTarget={flyTarget}
              focusKey={focusKey}
            />
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999]">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">User Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedUser.profilePicture || undefined}
                        alt={`${selectedUser.firstname} ${selectedUser.lastname}`}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {selectedUser.firstname.charAt(0)}
                        {selectedUser.lastname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {selectedUser.firstname} {selectedUser.lastname}
                      </h4>
                      <p className="text-sm text-gray-600">ID: {selectedUser.id}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <Badge
                      variant={
                        selectedUser.isSuspend ? "destructive" : selectedUser.isDisable ? "secondary" : "default"
                      }
                    >
                      {selectedUser.isSuspend ? "Suspended" : selectedUser.isDisable ? "Disabled" : "Active"}
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {geocodedAddresses[selectedUser.id] || selectedUser.pickup_address || "Loading location..."}
                      </span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Account Information
                    </h5>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(selectedUser.createdAt._seconds * 1000).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Updated:</span>{" "}
                        {new Date(selectedUser.updatedAt._seconds * 1000).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Referral Code:</span> {selectedUser.referral}
                      </p>
                      {selectedUser.referredBy && (
                        <p>
                          <span className="font-medium">Referred by:</span> {selectedUser.referredBy}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">City:</span> {selectedUser.city}, {selectedUser.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}