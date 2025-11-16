import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
	const { login } = useAuth()
	const location = useLocation() as any
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError(null)
		const ok = await login(username.trim(), password)
		if (!ok) {
			setError('Kredensial tidak valid. Gunakan admin / admin123')
		}
	}

	const fromPath = location?.state?.from?.pathname as string | undefined

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
				<h1 className="text-2xl font-extrabold text-gray-800 mb-1">Login Admin</h1>
				<p className="text-sm text-gray-500 mb-6">Masuk untuk melihat daftar laporan.</p>
				{fromPath && (
					<p className="text-xs text-blue-600 mb-2">Anda perlu login untuk mengakses: {fromPath}</p>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
						<input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="admin"
							autoComplete="username"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="admin123"
							autoComplete="current-password"
						/>
					</div>
					{error && <div className="text-sm text-red-600">{error}</div>}
					<button
						type="submit"
						className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
					>
						Login
					</button>
				</form>
				<div className="mt-4 text-center">
					<Link to="/" className="text-sm text-blue-700 hover:underline">Kembali ke landing</Link>
				</div>
			</div>
		</div>
	)
}


