import type { ReportsResponse, GeoJSONResponse, Report } from '../types'
import dummyData from '../data/dummyReports.json'

// Helper function to convert raw data to Report type (filtering out extra fields)
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
    severity: data.severity,
    happenedAt: data.happenedAt,
    createdAt: data.createdAt,
    lat: data.lat,
    lon: data.lon,
  }
}

// Create a mutable copy of the reports array for local operations
let reportsData: Report[] = dummyData.reports.map(toReport)

// Helper function to convert Report to GeoJSON feature
function reportToGeoJSONFeature(report: Report): GeoJSONResponse['features'][0] {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [report.lon, report.lat], // GeoJSON uses [lon, lat]
    },
    properties: {
      id: report.id,
      type: report.disasterType,
      desc: report.description,
      address: report.address,
      kecamatan: report.kecamatan,
      desa: report.desa,
      severity: report.severity,
      created_at: report.createdAt,
    },
  }
}

export const reportsApi = {
  getReports: async (page = 1, size = 50): Promise<ReportsResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    const paginatedReports = reportsData.slice(startIndex, endIndex)
    
    return {
      items: paginatedReports,
      page,
      size,
      total: reportsData.length,
    }
  },

  getReportsGeoJSON: async (): Promise<GeoJSONResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      type: 'FeatureCollection',
      features: reportsData.map(reportToGeoJSONFeature),
    }
  },

  deleteReport: async (id: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = reportsData.findIndex(r => r.id === id)
    if (index === -1) {
      return {
        success: false,
        message: 'Report not found',
      }
    }
    
    reportsData = reportsData.filter(r => r.id !== id)
    return {
      success: true,
      message: 'Report deleted successfully',
    }
  },

  getHealth: async (): Promise<{ ok: boolean }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return { ok: true }
  },
}


