import { Navigate, Outlet, useLocation } from "react-router-dom"
import { usePermisos } from "@/hooks/usePermisos"
import type { Permiso } from "@/lib/permisos"

interface RoleGuardProps {
  /** Permiso de la matriz de roles (src/lib/permisos.ts) que exige la ruta. */
  permiso: Permiso
  children?: React.ReactNode
}

/**
 * Protege una ruta según el rol (RF-31). Si el rol no tiene el permiso, lo lleva
 * a su pantalla de inicio (el Asesor no tiene Dashboard, así que no se usa
 * /dashboard fijo para no entrar en un bucle de redirecciones).
 */
export function RoleGuard({ permiso, children }: RoleGuardProps) {
  const location = useLocation()
  const { puede, inicio } = usePermisos()

  if (!puede(permiso)) {
    return <Navigate to={inicio} state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
