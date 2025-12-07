import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeoJSONResponse } from '../types'

// Color mapping for disaster types
const disasterColors: Record<string, string> = {
  banjir: '#3b82f6', // blue
  kebakaran: '#ef4444', // red
  longsor: '#f59e0b', // amber
  angin: '#8b5cf6', // purple
  gempa: '#ec4899', // pink
  lainnya: '#6b7280', // gray
}

function getDisasterColor(type: string): string {
  return disasterColors[type.toLowerCase()] || disasterColors.lainnya
}

// Create custom marker icons based on disaster type
function createCustomIcon(type: string): L.DivIcon {
  const color = getDisasterColor(type)
  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

interface DisasterMapProps {
  data: GeoJSONResponse | null
  isLoading: boolean
}

// Kabupaten Sanggau coordinates
const SANGGAU_CENTER: [number, number] = [0.1667, 110.1667]
const DEFAULT_ZOOM = 10

// Component to handle map bounds updates
function MapBoundsUpdater({ data }: { data: GeoJSONResponse | null }) {
  const map = useMap()

  useEffect(() => {
    if (data && data.features.length > 0) {
      const bounds = L.latLngBounds(
        data.features.map((feature) => {
          const [lon, lat] = feature.geometry.coordinates
          return [lat, lon] as [number, number]
        })
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [data, map])

  return null
}

// Component to load and display regency boundary
function RegencyBoundary() {
  const [boundaryData, setBoundaryData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        // Fetch Sanggau Regency boundary from Overpass API
        const query = `
          [out:json][timeout:25];
          relation["name"="Kabupaten Sanggau"]["admin_level"="5"];
          out geom;
        `
        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        )
        const data = await response.json()
        
        if (data.elements && data.elements.length > 0) {
          // Convert Overpass format to GeoJSON
          const element = data.elements[0]
          const coordinates = element.members
            ?.filter((m: any) => m.type === 'way' && m.role === 'outer')
            .map((m: any) => m.geometry?.map((g: any) => [g.lon, g.lat]))
            .filter((c: any) => c && c.length > 0)

          if (coordinates && coordinates.length > 0) {
            const geoJson = {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: { name: 'Kabupaten Sanggau' },
                geometry: {
                  type: 'Polygon',
                  coordinates: coordinates
                }
              }]
            }
            setBoundaryData(geoJson)
          }
        }
      } catch (error) {
        console.error('Error fetching boundary:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoundary()
  }, [])

  if (isLoading || !boundaryData) return null

  return (
    <GeoJSON
      data={boundaryData}
      style={{
        color: '#2563eb',
        weight: 3,
        opacity: 0.8,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        dashArray: '5, 5'
      }}
    />
  )
}

// Component to load and display district (kecamatan) boundaries
function DistrictBoundary() {
  const [boundaryData, setBoundaryData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        // Fetch all kecamatan (districts) within Kabupaten Sanggau
        // Using bounding box around Sanggau and filtering for kecamatan boundaries
        // Kecamatan are typically admin_level=6 or admin_level=7 in Indonesia
        const query = `
          [out:json][timeout:60];
          (
            relation["boundary"="administrative"]["admin_level"~"^[67]$"](109.0,0.0,111.0,1.0);
          );
          out geom;
        `
        
        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        )
        const data = await response.json()
          
        if (data.elements && data.elements.length > 0) {
          // Convert Overpass format to GeoJSON
          // Filter for kecamatan (districts) - usually have "Kecamatan" or "Kec." in name or are admin_level 6/7
          const features = data.elements
            .filter((element: any) => {
              if (element.type !== 'relation' || !element.members) return false
              const name = element.tags?.name || ''
              const nameId = element.tags?.['name:id'] || ''
              // Include if it's a kecamatan (contains "Kecamatan" or similar) or admin_level 6/7
              return (
                name.toLowerCase().includes('kecamatan') ||
                name.toLowerCase().includes('kec.') ||
                name.toLowerCase().includes('kec ') ||
                nameId.toLowerCase().includes('kecamatan') ||
                element.tags?.admin_level === '6' ||
                element.tags?.admin_level === '7'
              )
            })
            .map((element: any) => {
                // Get outer boundaries
                const outerWays = element.members
                  .filter((m: any) => m.type === 'way' && m.role === 'outer' && m.geometry)
                  .map((m: any) => 
                    m.geometry
                      .filter((g: any) => g.lat && g.lon)
                      .map((g: any) => [g.lon, g.lat])
                  )
                  .filter((coords: any) => coords && coords.length > 0)

                if (outerWays.length === 0) return null

                // If multiple outer ways, create MultiPolygon; otherwise Polygon
                const geometry = outerWays.length === 1
                  ? {
                      type: 'Polygon',
                      coordinates: [outerWays[0]]
                    }
                  : {
                      type: 'MultiPolygon',
                      coordinates: outerWays.map((way: any) => [way])
                    }

                return {
                  type: 'Feature',
                  properties: {
                    name: element.tags?.name || element.tags?.['name:id'] || 'Kecamatan',
                    admin_level: element.tags?.admin_level
                  },
                  geometry
                }
              })
              .filter((f: any) => f !== null)

          if (features.length > 0) {
            setBoundaryData({
              type: 'FeatureCollection',
              features
            })
          }
        }
      } catch (error) {
        console.error('Error fetching district boundaries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoundary()
  }, [])

  if (isLoading || !boundaryData) return null

  // Style function for districts
  const styleDistrict = (_feature: any) => ({
    color: '#10b981', // Green color for district boundaries
    weight: 2,
    opacity: 0.7,
    fillColor: '#10b981',
    fillOpacity: 0.05,
    dashArray: '3, 3'
  })

  // Add popup on click
  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<strong>Kecamatan:</strong> ${feature.properties.name}`)
    }
  }

  return (
    <GeoJSON
      data={boundaryData}
      style={styleDistrict}
      onEachFeature={onEachFeature}
    />
  )
}

export default function DisasterMap({ data, isLoading }: DisasterMapProps) {
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Memuat peta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={SANGGAU_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Update map bounds when data changes */}
        <MapBoundsUpdater data={data} />

        {/* Display regency boundary */}
        <RegencyBoundary />

        {/* Display district (kecamatan) boundaries */}
        <DistrictBoundary />

      {/* Render disaster markers */}
      {data?.features.map((feature) => {
        const [lon, lat] = feature.geometry.coordinates
        const customIcon = createCustomIcon(feature.properties.type)

        return (
          <Marker
            key={feature.properties.id}
            position={[lat, lon]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-base mb-2 text-gray-800">
                  {feature.properties.type.toUpperCase()}
                </h3>
                {feature.properties.desc && (
                  <p className="text-sm text-gray-700 mb-2">
                    {feature.properties.desc}
                  </p>
                )}
                {feature.properties.address && (
                  <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
                    <span>📍</span>
                    <span>{feature.properties.address}</span>
                  </p>
                )}
                {(feature.properties.kecamatan || feature.properties.desa) && (
                  <p className="text-sm text-gray-600 mb-2">
                    {feature.properties.kecamatan && (
                      <span><span className="font-semibold">Kecamatan:</span> {feature.properties.kecamatan}</span>
                    )}
                    {feature.properties.kecamatan && feature.properties.desa && <span> • </span>}
                    {feature.properties.desa && (
                      <span><span className="font-semibold">Desa:</span> {feature.properties.desa}</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                  {new Date(feature.properties.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-2xl p-4 z-[1000] border border-gray-200 max-w-[200px]">
        <h3 className="font-bold text-sm mb-3 text-gray-800 flex items-center gap-2">
          <span>🗺️</span>
          <span>Legenda</span>
        </h3>
        <div className="space-y-2">
          {Object.entries(disasterColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-700 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

