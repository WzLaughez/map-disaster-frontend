import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthContextValue = {
	isAuthenticated: boolean
	isAdmin: boolean
	isReady: boolean
	login: (username: string, password: string) => Promise<boolean>
	logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Initialize from localStorage synchronously to avoid redirect flicker
	const stored = (() => {
		try {
			const raw = localStorage.getItem('auth_state')
			return raw ? JSON.parse(raw) : null
		} catch {
			return null
		}
	})()
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(stored?.isAuthenticated))
	const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(stored?.isAdmin))
	const [isReady] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated, isAdmin }))
	}, [isAuthenticated, isAdmin])

	const login = async (username: string, password: string) => {
		// simple frontend-only check. Do NOT use in production.
		const ok = username === 'admin' && password === 'admin123'
		if (ok) {
			setIsAuthenticated(true)
			setIsAdmin(true)
			navigate('/admin/reports')
			return true
		}
		return false
	}

	const logout = () => {
		setIsAuthenticated(false)
		setIsAdmin(false)
		navigate('/')
	}

	const value = useMemo<AuthContextValue>(() => ({
		isAuthenticated,
		isAdmin,
		isReady,
		login,
		logout
	}), [isAuthenticated, isAdmin, isReady])

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}


