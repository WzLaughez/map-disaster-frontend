import { useEffect, useState } from 'react'
import ReportList from '../components/ReportList'
import { reportsApi } from '../services/api'
import type { GeoJSONResponse, Report } from '../types'
import { useAuth } from '../context/AuthContext'
import DisasterMap from '../components/DisasterMap'
import WaQr from '../components/WaQr'

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

