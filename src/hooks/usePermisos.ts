import { useAuthStore } from '@/features/auth/store/authStore'
import { rutaInicio, tienePermiso, type Permiso } from '@/lib/permisos'

/** Permisos del usuario con sesión: `puede('facturacion.gestionar')`. */
export function usePermisos() {
  const nombreRol = useAuthStore((s) => s.nombreRol)
  return {
    nombreRol,
    puede: (permiso: Permiso) => tienePermiso(nombreRol, permiso),
    inicio: rutaInicio(nombreRol),
  }
}
