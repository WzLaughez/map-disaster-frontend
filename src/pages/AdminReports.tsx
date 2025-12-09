import { useEffect, useState, useCallback } from 'react'
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
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [startDate, setStartDate] = useState<string>('')
	const [endDate, setEndDate] = useState<string>('')
	const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all')

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true)
			const [geoJson, res] = await Promise.all([
				reportsApi.getReportsGeoJSON(),
				reportsApi.getReports(1, 100, searchQuery || undefined, startDate || undefined, endDate || undefined),
			])
			setGeoJsonData(geoJson)
			setReports(res.items)
		} catch (e) {
			console.error(e)
			alert('Gagal memuat data. Pastikan backend berjalan.')
		} finally {
			setIsLoading(false)
		}
	}, [searchQuery, startDate, endDate])

	useEffect(() => { 
		// Debounce search to avoid too many API calls
		const timeoutId = setTimeout(() => {
			loadData()
		}, searchQuery ? 500 : 0)
		
		return () => clearTimeout(timeoutId)
	}, [loadData, searchQuery])

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
					<DisasterMap 
						data={geoJsonData} 
						isLoading={isLoading}
						filterType={disasterTypeFilter}
						onFilterChange={setDisasterTypeFilter}
						onReportClick={async (reportId) => {
							// Find the report in the current reports list
							let report = reports.find(r => r.id === reportId)
							if (!report) {
								// If not found, try to fetch it by searching for the ID
								try {
									const response = await reportsApi.getReports(1, 100, reportId, undefined, undefined)
									report = response.items.find(r => r.id === reportId)
								} catch (error) {
									console.error('Failed to fetch report:', error)
								}
							}
							if (report) {
								setSelectedReport(report)
							} else {
								alert('Laporan tidak ditemukan')
							}
						}}
					/>

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
						searchQuery={searchQuery}
						startDate={startDate}
						endDate={endDate}
						onSearchChange={setSearchQuery}
						onDateRangeChange={(start, end) => {
							setStartDate(start)
							setEndDate(end)
						}}
						disasterTypeFilter={disasterTypeFilter}
						onDisasterTypeFilterChange={setDisasterTypeFilter}
					/>
				</div>
			</main>

			{selectedReport && (
				<div
					className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
					onClick={() => setSelectedReport(null)}
				>
					<div
						className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
									<span className="text-2xl">📋</span>
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-900">Detail Laporan</h2>
									<p className="text-xs text-gray-500 mt-0.5 font-mono">
										ID: {selectedReport.id}
									</p>
								</div>
							</div>
							<button
								onClick={() => setSelectedReport(null)}
								className="text-gray-400 hover:text-gray-700 hover:bg-white/80 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:rotate-90 text-xl"
								aria-label="Tutup"
							>
								✕
							</button>
						</div>

						{/* Scrollable Content */}
						<div className="flex-1 overflow-y-auto p-6">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Left Column - Main Info */}
								<div className="lg:col-span-2 space-y-6">
									{/* Disaster Type - Hero Section */}
									<div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-5 text-white shadow-lg">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
													Jenis Bencana
												</p>
												<h1 className="text-3xl font-bold capitalize">
													{selectedReport.disasterType}
												</h1>
											</div>
											<div className="text-5xl opacity-20">
												{selectedReport.disasterType === 'banjir' && '🌊'}
												{selectedReport.disasterType === 'kebakaran' && '🔥'}
												{selectedReport.disasterType === 'longsor' && '⛰️'}
												{selectedReport.disasterType === 'angin kencang' && '💨'}
												{selectedReport.disasterType === 'gempa' && '🌍'}
												{!['banjir', 'kebakaran', 'longsor', 'angin kencang', 'gempa'].includes(selectedReport.disasterType) && '⚠️'}
											</div>
										</div>
									</div>

									{/* Description */}
									{selectedReport.description && (
										<div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
											<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
												<span className="text-base">📝</span>
												Deskripsi Kejadian
											</h3>
											<p className="text-gray-800 leading-relaxed">
												{selectedReport.description}
											</p>
										</div>
									)}

									{/* Media Gallery */}
									{selectedReport.mediaUrls && selectedReport.mediaUrls.length > 0 && (
										<div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
											<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
												<span className="text-base">📷</span>
												Foto Dokumentasi ({selectedReport.mediaUrls.length})
											</h3>
											<div className={`grid gap-3 ${
												selectedReport.mediaUrls.length === 1 
													? 'grid-cols-1' 
													: selectedReport.mediaUrls.length === 2
													? 'grid-cols-1 sm:grid-cols-2'
													: 'grid-cols-1 sm:grid-cols-2'
											}`}>
												{selectedReport.mediaUrls.map((mediaUrl, index) => {
													const imageUrl = getImageUrl(mediaUrl)
													return (
														<div key={index} className="relative group">
															<div 
																className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer"
																onClick={() => window.open(imageUrl, '_blank')}
															>
																<img
																	src={imageUrl}
																	alt={`Dokumentasi bencana ${index + 1}`}
																	className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
																	loading="lazy"
																	onError={(e) => {
																		const target = e.target as HTMLImageElement
																		target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E'
																		target.onerror = null
																	}}
																/>
																<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
																	<div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
																		<svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
																		</svg>
																	</div>
																</div>
															</div>
															<p className="text-xs text-gray-500 mt-1.5 text-center">
																Foto {index + 1}
															</p>
														</div>
													)
												})}
											</div>
											<p className="text-xs text-gray-500 mt-3 italic text-center">
												Klik gambar untuk melihat ukuran penuh
											</p>
										</div>
									)}
								</div>

								{/* Right Column - Sidebar Info */}
								<div className="space-y-4">
									{/* Location Info */}
									<div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
										<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
											<span className="text-base">📍</span>
											Informasi Lokasi
										</h3>
										<div className="space-y-3">
											{selectedReport.address && (
												<div>
													<p className="text-xs text-gray-500 mb-1">Alamat</p>
													<p className="text-gray-900 font-medium text-sm">{selectedReport.address}</p>
												</div>
											)}
											{(selectedReport.kecamatan || selectedReport.desa) && (
												<div>
													<p className="text-xs text-gray-500 mb-1">Wilayah Administratif</p>
													<div className="space-y-1">
														{selectedReport.kecamatan && (
															<p className="text-gray-900 text-sm">
																<span className="font-semibold">Kecamatan:</span> {selectedReport.kecamatan}
															</p>
														)}
														{selectedReport.desa && (
															<p className="text-gray-900 text-sm">
																<span className="font-semibold">Desa/Kelurahan:</span> {selectedReport.desa}
															</p>
														)}
													</div>
												</div>
											)}
											{(selectedReport.lat && selectedReport.lon) && (
												<div>
													<p className="text-xs text-gray-500 mb-1">Koordinat</p>
													<p className="text-gray-900 font-mono text-xs">
														{selectedReport.lat.toFixed(6)}, {selectedReport.lon.toFixed(6)}
													</p>
													<a
														href={`https://www.google.com/maps?q=${selectedReport.lat},${selectedReport.lon}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 inline-flex items-center gap-1"
													>
														Buka di Google Maps
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
														</svg>
													</a>
												</div>
											)}
										</div>
									</div>

									{/* Reporter Info */}
									<div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
										<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
											<span className="text-base">👤</span>
											Informasi Pelapor
										</h3>
										<div className="space-y-2">
											{selectedReport.name && (
												<div>
													<p className="text-xs text-gray-500 mb-1">Nama</p>
													<p className="text-gray-900 font-medium text-sm">{selectedReport.name}</p>
												</div>
											)}
											{selectedReport.reporterWa && (
												<div>
													<p className="text-xs text-gray-500 mb-1">Nomor WhatsApp</p>
													<p className="text-gray-900 font-mono text-xs">{selectedReport.reporterWa}</p>
												</div>
											)}
										</div>
									</div>

									{/* Timestamp */}
									<div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 shadow-sm">
										<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
											<span className="text-base">📅</span>
											Waktu Laporan
										</h3>
										<p className="text-gray-900 font-semibold text-sm">
											{new Date(selectedReport.createdAt).toLocaleDateString('id-ID', {
												weekday: 'long',
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})}
										</p>
										<p className="text-gray-600 text-xs mt-1">
											{new Date(selectedReport.createdAt).toLocaleTimeString('id-ID', {
												hour: '2-digit',
												minute: '2-digit',
												second: '2-digit'
											})}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

