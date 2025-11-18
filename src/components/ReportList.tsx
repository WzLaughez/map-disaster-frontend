import { useState } from 'react'
import type { Report } from '../types'
import { reportsApi } from '../services/api'

interface ReportListProps {
  reports: Report[]
  isLoading: boolean
  onReportClick?: (report: Report) => void
  onDataChange?: () => void
}

const disasterTypeLabels: Record<string, string> = {
  banjir: 'Banjir',
  kebakaran: 'Kebakaran',
  longsor: 'Longsor',
  angin: 'Angin Kencang',
  gempa: 'Gempa',
  lainnya: 'Lainnya',
}

const severityColors: Record<string, string> = {
  rendah: 'bg-green-100 text-green-800',
  sedang: 'bg-yellow-100 text-yellow-800',
  tinggi: 'bg-red-100 text-red-800',
}

export default function ReportList({ reports, isLoading, onReportClick, onDataChange }: ReportListProps) {
  const [filter, setFilter] = useState<string>('all')
  const [filterKecamatan, setFilterKecamatan] = useState<string>('all')
  const [filterDesa, setFilterDesa] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  
  // Extract unique kecamatan and desa values
  const uniqueKecamatans = Array.from(new Set(
    reports
      .map(r => r.kecamatan)
      .filter((k): k is string => k !== null && k !== undefined)
  )).sort()

  // Get unique desa values (can be filtered by selected kecamatan)
  const uniqueDesas = Array.from(new Set(
    reports
      .filter(r => filterKecamatan === 'all' || r.kecamatan === filterKecamatan)
      .map(r => r.desa)
      .filter((d): d is string => d !== null && d !== undefined)
  )).sort()

  const handleDelete = async (reportId: string) => {
    try {
      setDeletingId(reportId)
      await reportsApi.deleteReport(reportId)
      setConfirmDeleteId(null)
      // Refresh the data
      onDataChange?.()
    } catch (error) {
      console.error('Failed to delete report:', error)
      alert('Gagal menghapus laporan. Silakan coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  // Reset desa filter when kecamatan changes
  const handleKecamatanChange = (value: string) => {
    setFilterKecamatan(value)
    setFilterDesa('all') // Reset desa filter when kecamatan changes
  }

  // Apply all filters
  const filteredReports = reports.filter(r => {
    // Filter by disaster type
    const matchesType = filter === 'all' || r.disasterType.toLowerCase() === filter.toLowerCase()
    
    // Filter by kecamatan
    const matchesKecamatan = filterKecamatan === 'all' || r.kecamatan === filterKecamatan
    
    // Filter by desa
    const matchesDesa = filterDesa === 'all' || r.desa === filterDesa
    
    return matchesType && matchesKecamatan && matchesDesa
  })

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Disaster Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Bencana</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">Semua Jenis Bencana</option>
              <option value="banjir">Banjir</option>
              <option value="kebakaran">Kebakaran</option>
              <option value="longsor">Longsor</option>
              <option value="angin">Angin Kencang</option>
              <option value="gempa">Gempa</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          {/* Kecamatan Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kecamatan</label>
            <select
              value={filterKecamatan}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">Semua Kecamatan</option>
              {uniqueKecamatans.map((kecamatan) => (
                <option key={kecamatan} value={kecamatan}>
                  {kecamatan}
                </option>
              ))}
            </select>
          </div>

          {/* Desa Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Desa/Kelurahan</label>
            <select
              value={filterDesa}
              onChange={(e) => setFilterDesa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              disabled={filterKecamatan !== 'all' && uniqueDesas.length === 0}
            >
              <option value="all">Semua Desa/Kelurahan</option>
              {uniqueDesas.map((desa) => (
                <option key={desa} value={desa}>
                  {desa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filter !== 'all' || filterKecamatan !== 'all' || filterDesa !== 'all') && (
          <button
            onClick={() => {
              setFilter('all')
              setFilterKecamatan('all')
              setFilterDesa('all')
            }}
            className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
          >
            🔄 Reset Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Nama
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                No HP
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Jenis
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Kecamatan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Desa/Kelurahan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Lokasi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Keparahan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Waktu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  <p>Tidak ada laporan bencana</p>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportClick?.(report)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {report.id}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {report.name || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {report.reporterWa || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {disasterTypeLabels[report.disasterType.toLowerCase()] || report.disasterType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                    {report.description || '-'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                    {report.kecamatan || '-'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                    {report.desa || '-'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                    {report.address || (report.lat && report.lon ? `${report.lat.toFixed(6)}, ${report.lon.toFixed(6)}` : '-')}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {report.severity ? (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      severityColors[report.severity.toLowerCase()] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {report.severity}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onReportClick?.(report)
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors mr-3"
                  >
                    Lihat
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDeleteId(report.id)
                    }}
                    disabled={deletingId === report.id}
                    className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === report.id ? 'Menghapus...' : 'Hapus'}
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="px-4 py-2 border-t bg-gray-50">
        <p className="text-xs text-gray-600">
          Menampilkan {filteredReports.length} dari {reports.length} laporan
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Konfirmasi Hapus</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

