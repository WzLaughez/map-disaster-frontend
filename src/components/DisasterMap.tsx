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

export default function DisasterMap({ data, isLoading }: DisasterMapProps) {
  const [filterType, setFilterType] = useState<string>('all')

  // Filter features based on disaster type
  const filteredData = data ? {
    ...data,
    features: filterType === 'all' 
      ? data.features 
      : data.features.filter(feature => {
          const featureType = feature.properties.type.toLowerCase()
          const selectedType = filterType.toLowerCase()
          // Handle "angin kencang" and "angin" as the same
          if (selectedType === 'angin' || selectedType === 'angin kencang') {
            return featureType === 'angin kencang' || featureType === 'angin'
          }
          return featureType === selectedType
        })
  } : null

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
      {/* Filter Dropdown */}
      <div className="absolute top-6 left-6 bg-white rounded-xl shadow-2xl p-3 z-[1000] border border-gray-200">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Filter Jenis Bencana</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[180px]"
        >
          <option value="all">Semua Jenis Bencana</option>
          <option value="banjir">Banjir</option>
          <option value="kebakaran">Kebakaran</option>
          <option value="longsor">Longsor</option>
          <option value="angin kencang">Angin Kencang</option>
          <option value="gempa">Gempa</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>

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
        <MapBoundsUpdater data={filteredData} />

        {/* Display regency boundary */}
        <RegencyBoundary />

      {/* Render disaster markers */}
      {filteredData?.features.map((feature) => {
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
                {feature.properties.severity && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Keparahan:</span> {feature.properties.severity}
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

