export interface Report {
  id: string
  name: string | null
  reporterWa: string
  disasterType: string
  description: string | null
  kecamatan: string | null
  desa: string | null
  address: string | null
  severity: string | null
  happenedAt: string | null
  createdAt: string
  lat: number
  lon: number
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
    type: string
    desc: string | null
    address: string | null
    kecamatan: string | null
    desa: string | null
    severity: string | null
    created_at: string
  }
}

export interface GeoJSONResponse {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}


