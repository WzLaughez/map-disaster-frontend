import { useState, useEffect } from 'react'
import DisasterMap from '../components/DisasterMap'
import ReportList from '../components/ReportList'
import { reportsApi } from '../services/api'
import type { GeoJSONResponse, Report } from '../types'
import WaQr from '../components/WaQr'

export default function Home() {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONResponse | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [geoJson, reportsData] = await Promise.all([
        reportsApi.getReportsGeoJSON(),
        reportsApi.getReports(1, 50),
      ])
      setGeoJsonData(geoJson)
      setReports(reportsData.items)
      console.log('Loaded reports:', reportsData.items.length, reportsData)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Gagal memuat data. Pastikan backend server berjalan dan database sudah diupdate.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <span className="text-4xl">🚨</span>
                Sistem Pelaporan Bencana
              </h1>
              <p className="text-sm text-blue-100 mt-1 flex items-center gap-2">
                <span>📱 Lapor via WhatsApp</span>
                <span className="text-blue-300">•</span>
                <span>🗺️ Lihat di Peta</span>
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <p className="text-xs text-blue-100">Status Sistem</p>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Aktif
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Map Section */}
        <div className="flex-1 h-full lg:h-auto relative bg-gray-200">
          <DisasterMap data={geoJsonData} isLoading={isLoading} />
          
          {/* Stats Badge */}
          {!isLoading && geoJsonData && (
            <div className="absolute top-6 right-6 bg-white rounded-2xl shadow-2xl p-4 z-[1000] border border-gray-200 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Laporan</p>
                  <p className="text-2xl font-bold text-gray-800">{geoJsonData.features.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp QR Code - Floating Button */}
          <div className="absolute bottom-6 right-6 z-[1000]">
            <WaQr />
          </div>
        </div>

        {/* Report List Section */}
        <div className="w-full lg:w-1/2 xl:w-2/5 border-t lg:border-t-0 lg:border-l-2 border-gray-200 flex flex-col bg-white shadow-xl">
          <ReportList
            reports={reports}
            isLoading={isLoading}
            onReportClick={setSelectedReport}
            onDataChange={loadData}
          />
        </div>
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                  <span className="text-2xl">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Detail Laporan</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:rotate-90"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                <span className="text-xs text-red-600 font-semibold uppercase tracking-wide">Jenis Bencana</span>
                <p className="font-bold text-lg text-red-700 mt-1">{selectedReport.disasterType}</p>
              </div>
              
              {selectedReport.description && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Deskripsi</span>
                  <p className="text-gray-800 mt-1 leading-relaxed">{selectedReport.description}</p>
                </div>
              )}
              
              {selectedReport.address && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide flex items-center gap-1">
                    📍 Alamat
                  </span>
                  <p className="text-gray-800 mt-1">{selectedReport.address}</p>
                </div>
              )}
              
              {(selectedReport.kecamatan || selectedReport.desa) && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <span className="text-xs text-green-600 font-semibold uppercase tracking-wide flex items-center gap-1">
                    🗺️ Wilayah Administratif
                  </span>
                  <div className="text-gray-800 mt-1 space-y-1">
                    {selectedReport.kecamatan && (
                      <p><span className="font-semibold">Kecamatan:</span> {selectedReport.kecamatan}</p>
                    )}
                    {selectedReport.desa && (
                      <p><span className="font-semibold">Desa/Kelurahan:</span> {selectedReport.desa}</p>
                    )}
                  </div>
                </div>
              )}
              
              {selectedReport.severity && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <span className="text-xs text-yellow-700 font-semibold uppercase tracking-wide">⚠️ Keparahan</span>
                  <p className="text-gray-800 mt-1 font-semibold">{selectedReport.severity}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">🕒 Waktu Kejadian</span>
                  <p className="text-gray-800 mt-1 text-sm">
                    {selectedReport.happenedAt
                      ? new Date(selectedReport.happenedAt).toLocaleString('id-ID')
                      : 'Tidak disebutkan'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">📅 Dilaporkan</span>
                  <p className="text-gray-800 mt-1 text-sm">{new Date(selectedReport.createdAt).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


