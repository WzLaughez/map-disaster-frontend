import { Link } from 'react-router-dom'

function buildWaLink(): string {
	const raw = (import.meta as any).env?.VITE_WA_NUMBER as string | undefined
	const digits = (raw || '').replace(/[^\d]/g, '')
	const phone = digits || ''
	const base = 'https://wa.me/'
	const message = encodeURIComponent('LAPOR')
	return phone ? `${base}${phone}?text=${message}` : `${base}?text=${message}`
}

export default function Landing() {
	const waLink = buildWaLink()
	return (
		<div className="h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden flex flex-col">
			{/* Header */}
			<header className="flex-shrink-0 px-4 py-3 flex justify-end">
				<Link
					to="/login"
					className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold border border-blue-200 shadow-md hover:bg-blue-50 hover:shadow-lg transition-all text-sm"
				>
					Login Admin
				</Link>
			</header>

			{/* Main Content - Centered */}
			<div className="flex-1 flex items-center justify-center px-4">
				<div className="max-w-3xl mx-auto text-center">
					{/* Hero Icon */}
					<div className="mb-4 flex justify-center">
						<div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-xl">
							<span className="text-5xl">🚨</span>
						</div>
					</div>

					{/* Title */}
					<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
						Sistem Pelaporan
						<span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
							Bencana
						</span>
					</h1>

					{/* Subtitle */}
					<p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
						Laporkan kejadian bencana secara cepat melalui WhatsApp
					</p>

					{/* CTA Button */}
					<div className="mb-6">
						<a
							href={waLink}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
						>
							<span className="text-xl">💬</span>
							<span>Lapor Sekarang via WhatsApp</span>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>
						<p className="text-xs text-gray-500 mt-2">
							Klik tombol di atas, lalu ketik <span className="font-semibold text-gray-700">"LAPOR"</span> di WhatsApp
						</p>
					</div>

					{/* Features - Compact */}
					<div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
						<div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-200">
							<div className="text-2xl mb-1">⚡</div>
							<h3 className="font-bold text-xs text-gray-800 mb-1">Cepat</h3>
							<p className="text-gray-600 text-xs">
								Laporkan dalam hitungan detik
							</p>
						</div>

						<div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-200">
							<div className="text-2xl mb-1">📍</div>
							<h3 className="font-bold text-xs text-gray-800 mb-1">Lokasi</h3>
							<p className="text-gray-600 text-xs">
								Kirim lokasi GPS
							</p>
						</div>

						<div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-200">
							<div className="text-2xl mb-1">📷</div>
							<h3 className="font-bold text-xs text-gray-800 mb-1">Foto</h3>
							<p className="text-gray-600 text-xs">
								Lampirkan dokumentasi
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="flex-shrink-0 py-2 text-center text-xs text-gray-500">
				<p>Sistem Pelaporan Bencana - Kabupaten Sanggau</p>
			</footer>
		</div>
	)
}


