import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import type { UserRole } from '@/types'

interface Props {
  requiredRole?: UserRole
  children?: React.ReactNode
}

export default function ProtectedRoute({ requiredRole, children }: Props) {
  const { user, accessToken } = useAppSelector((state) => state.auth)

  if (!accessToken || !user) {
    return <Navigate to="/connexion" replace />
  }

  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
