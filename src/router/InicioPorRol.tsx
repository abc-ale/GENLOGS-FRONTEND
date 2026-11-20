import { Navigate } from "react-router-dom"
import { usePermisos } from "@/hooks/usePermisos"

/** Redirige "/" y las rutas desconocidas a la pantalla de inicio del rol. */
export function InicioPorRol() {
  const { inicio } = usePermisos()
  return <Navigate to={inicio} replace />
}
