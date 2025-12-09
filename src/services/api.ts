import axios from 'axios'
import type { ReportsResponse, GeoJSONResponse, Report } from '../types'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper function to convert raw data to Report type
function toReport(data: any): Report {
  return {
    id: data.id,
    name: data.name,
    reporterWa: data.reporterWa,
    disasterType: data.disasterType,
    description: data.description,
    kecamatan: data.kecamatan,
    desa: data.desa,
    address: data.address,
    createdAt: data.createdAt,
    lat: data.lat,
    lon: data.lon,
    mediaUrls: data.mediaUrls || [],
  }
}

export const reportsApi = {
  getReports: async (
    page = 1, 
    size = 50, 
    search?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<ReportsResponse> => {
    const params: any = { page, size }
    if (search) params.search = search
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await axios.get(`${apiBase}/api/reports`, { params })
    return {
      items: response.data.items.map(toReport),
      page: response.data.page,
      size: response.data.size,
      total: response.data.total,
    }
  },

  getReportsGeoJSON: async (): Promise<GeoJSONResponse> => {
    const response = await axios.get(`${apiBase}/api/reports.geojson`)
    return response.data
  },

  deleteReport: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${apiBase}/api/reports/${id}`)
    return response.data
  },

  getHealth: async (): Promise<{ ok: boolean }> => {
    const response = await axios.get(`${apiBase}/health`)
    return response.data
  },
}


