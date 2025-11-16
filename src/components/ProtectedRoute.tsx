import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isAdmin, isReady } = useAuth()
	const location = useLocation()
	if (!isReady) {
		return null
	}
	if (!isAuthenticated || !isAdmin) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}
	return <>{children}</>
}


