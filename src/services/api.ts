import axios from 'axios'
import type { ReportsResponse, GeoJSONResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const reportsApi = {
  getReports: async (page = 1, size = 50): Promise<ReportsResponse> => {
    const response = await api.get<ReportsResponse>('/api/reports', {
      params: { page, size },
    })
    return response.data
  },

  getReportsGeoJSON: async (): Promise<GeoJSONResponse> => {
    const response = await api.get<GeoJSONResponse>('/api/reports.geojson')
    return response.data
  },

  deleteReport: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/reports/${id}`)
    return response.data
  },

  getHealth: async (): Promise<{ ok: boolean }> => {
    const response = await api.get<{ ok: boolean }>('/health')
    return response.data
  },
}


