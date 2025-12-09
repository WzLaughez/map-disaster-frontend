export interface Report {
  id: string
  name: string | null
  reporterWa: string
  disasterType: string
  description: string | null
  kecamatan: string | null
  desa: string | null
  address: string | null
  createdAt: string
  lat: number
  lon: number
  mediaUrls?: string[] // Array of media URLs
}

export interface ReportsResponse {
  items: Report[]
  page: number
  size: number
  total: number
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [lon, lat]
  }
  properties: {
    id: string
    name: string | null
    reporterWa: string
    type: string
    desc: string | null
    address: string | null
    kecamatan: string | null
    desa: string | null
    created_at: string
    mediaUrls?: string[] // Optional, may not be in GeoJSON but can be fetched
  }
}

export interface GeoJSONResponse {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}


