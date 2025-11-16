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
		<div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
			<div className="absolute top-4 right-4">
				<Link
					to="/login"
					className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold border border-blue-200 shadow hover:bg-blue-50 transition"
				>
					Login
				</Link>
			</div>
			<div className="text-center px-6">
				<h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
					Sistem Pelaporan Bencana
				</h1>
				<p className="text-gray-600 mb-8 max-w-xl mx-auto">
					Laporkan kejadian bencana secara cepat melalui WhatsApp. Tekan tombol di bawah dan ketik "LAPOR".
				</p>
				<a
					href={waLink}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-2xl shadow-lg transition"
				>
					Lapor Sekarang
				</a>
			</div>
		</div>
	)
}


