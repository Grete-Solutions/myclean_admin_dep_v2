import React, { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Users, UserCheck, UserX, Clock, Phone, Mail, Calendar, X } from "lucide-react"

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

// No mock data - using your original API fetch logic

// Reverse geocoding function
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "UserLocationApp/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data: GeocodedAddress = await response.json()
    const { address } = data
    const parts = []

    if (address.road) parts.push(address.road)
    if (address.suburb) parts.push(address.suburb) 
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)

    return parts.length > 0 ? parts.join(", ") : data.display_name
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return "Location unavailable"
  }
}

// Main Map Component
const MapComponent = ({
  users,
  onMarkerClick,
  geocodedAddresses,
}: {
  users: UserData[]
  onMarkerClick: (user: UserData) => void
  geocodedAddresses: Record<string, string>
}) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Add Leaflet CSS
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = LEAFLET_CSS
      document.head.appendChild(style)
      
      // Add Leaflet CSS from CDN
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
      <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (validUsers.length === 0) {
    return (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No valid locations to display</p>
        </div>
      </div>
    )
  }

  // Calculate center and bounds - default to Ghana center
  const ghanaCenter: [number, number] = [7.9465, -1.0232] // Center of Ghana
  
  let center: [number, number] = ghanaCenter
  
  if (validUsers.length > 0) {
    const lats = validUsers.map((user) => user.pickup_location._latitude)
    const lngs = validUsers.map((user) => user.pickup_location._longitude)
    
    center = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ]
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={validUsers.length === 0 ? 7 : validUsers.length === 1 ? 15 : 8}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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

    // Process users in batches to avoid rate limiting
    const batchSize = 3
    for (let i = 0; i < validUsers.length; i += batchSize) {
      const batch = validUsers.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (user) => {
          try {
            const address = await reverseGeocode(user.pickup_location._latitude, user.pickup_location._longitude)
            addresses[user.id] = address
            setGeocodingProgress((prev) => ({ ...prev, current: prev.current + 1 }))
          } catch (error) {
            console.error(`Failed to geocode location for user ${user.id}:`, error)
            addresses[user.id] = user.pickup_address || "Location unavailable"
            setGeocodingProgress((prev) => ({ ...prev, current: prev.current + 1 }))
          }
        }),
      )

      // Update state with current batch results
      setGeocodedAddresses((prev) => ({ ...prev, ...addresses }))

      // Add delay between batches to respect rate limits
      if (i + batchSize < validUsers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
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

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Disabled</span>
            </div>
            <p className="text-2xl font-bold text-gray-600 mt-1">{stats.disabled}</p>
          </div>

          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Suspended</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.suspended}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <MapComponent 
          users={userData.data} 
          onMarkerClick={setSelectedUser} 
          geocodedAddresses={geocodedAddresses} 
        />

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