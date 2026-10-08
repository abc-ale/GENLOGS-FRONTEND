import { Navigate, useLocation } from "react-router-dom"
import { Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

interface RoleGuardProps {
  allowedRoles: string[]
  children?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const location = useLocation()
  // El rol real vive en el store de auth (nombreRol), no en localStorage:
  // "user_role" nunca se escribía en ningún lado, así que este guard siempre
  // bloqueaba a todos, incluido un ADMINISTRADOR real.
  const userRole = useAuthStore((state) => state.nombreRol) ?? ""

  if (!allowedRoles.includes(userRole.toUpperCase())) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}