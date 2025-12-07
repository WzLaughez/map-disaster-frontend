import { useEffect, useState } from 'react'
import ReportList from '../components/ReportList'
import { reportsApi } from '../services/api'
import type { GeoJSONResponse, Report } from '../types'
import { useAuth } from '../context/AuthContext'
import DisasterMap from '../components/DisasterMap'
import WaQr from '../components/WaQr'

// Helper function to get full image URL
const getImageUrl = (mediaUrl: string): string => {
  console.log('getImageUrl called with:', mediaUrl)
  
  if (mediaUrl.startsWith('http')) {
    return mediaUrl // Already a full URL
  }
  
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  // Remove trailing slash from apiBase if present
  const base = apiBase.replace(/\/$/, '')
  // Ensure mediaUrl starts with /
  const url = mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`
  const fullUrl = `${base}${url}`
  
  console.log('Constructed image URL:', fullUrl)
  return fullUrl
}

export default function AdminReports() {
	const { logout } = useAuth()
	const [reports, setReports] = useState<Report[]>([])
	const [geoJsonData, setGeoJsonData] = useState<GeoJSONResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [selectedReport, setSelectedReport] = useState<Report | null>(null)

	const loadData = async () => {
		try {
			setIsLoading(true)
			const [geoJson, res] = await Promise.all([
				reportsApi.getReportsGeoJSON(),
				reportsApi.getReports(1, 100),
			])
			setGeoJsonData(geoJson)
			setReports(res.items)
		} catch (e) {
			console.error(e)
			alert('Gagal memuat data. Pastikan backend berjalan.')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => { loadData() }, [])

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<header className="bg-white border-b sticky top-0 z-[9999]">
				<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h1 className="text-lg font-bold text-gray-800">Peta & Daftar Laporan</h1>
					</div>
					<button
						onClick={logout}
						className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900"
					>
						Logout
					</button>
				</div>
			</header>

			<main className="flex-1 overflow-hidden flex flex-col max-w-7xl mx-auto">
				<div className="w-full h-[60vh] relative bg-gray-200">
					<DisasterMap data={geoJsonData} isLoading={isLoading} />

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

					<div className="absolute bottom-6 right-6 z-[1000]">
						<WaQr />
					</div>
				</div>

				<div className="w-full border-t border-gray-200 flex flex-col bg-white shadow-xl">
					<ReportList
						reports={reports}
						isLoading={isLoading}
						onReportClick={setSelectedReport}
						onDataChange={loadData}
					/>
				</div>
			</main>

			{selectedReport && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
					onClick={() => setSelectedReport(null)}
				>
				<div
					className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
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

							{selectedReport.mediaUrls && selectedReport.mediaUrls.length > 0 && (
								<div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
									<span className="text-xs text-purple-600 font-semibold uppercase tracking-wide flex items-center gap-1 mb-3">
										📷 Foto Dokumentasi
									</span>
									<div className="space-y-3">
										{selectedReport.mediaUrls.map((mediaUrl, index) => (
											<div key={index} className="relative group">
												<img
													src={getImageUrl(mediaUrl)}
													alt={`Dokumentasi bencana ${index + 1}`}
													className="w-full h-auto rounded-lg border-2 border-purple-300 shadow-md hover:shadow-xl transition-all duration-200 cursor-zoom-in object-contain bg-gray-100"
													onClick={() => window.open(getImageUrl(mediaUrl), '_blank')}
													loading="lazy"
													onError={(e) => {
														const target = e.target as HTMLImageElement
														target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E'
														target.onerror = null // Prevent infinite loop
													}}
												/>
												<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors pointer-events-none" />
											</div>
										))}
									</div>
									<p className="text-xs text-purple-500 mt-3 italic flex items-center gap-1">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
										</svg>
										Klik gambar untuk melihat ukuran penuh
									</p>
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

							<div className="bg-gray-50 p-4 rounded-xl">
								<span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">📅 Dilaporkan</span>
								<p className="text-gray-800 mt-1 text-sm">{new Date(selectedReport.createdAt).toLocaleString('id-ID')}</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

