/**
 * Permisos por rol (RF-31). Es la misma matriz que aplica el backend en
 * SecurityConfig: los 3 trabajadores del negocio del documento (sección 2.1.2).
 * El backend es quien protege los datos (responde 403); aquí solo se ocultan
 * las pantallas y botones que el rol no puede usar.
 */

export const Rol = {
  ASESOR_COMERCIAL: 'ASESOR_COMERCIAL',
  JEFE_ADMINISTRATIVO: 'JEFE_ADMINISTRATIVO',
  CONTADOR_GENERAL: 'CONTADOR_GENERAL',
} as const
export type Rol = (typeof Rol)[keyof typeof Rol]

const { ASESOR_COMERCIAL: ASESOR, JEFE_ADMINISTRATIVO: JEFE, CONTADOR_GENERAL: CONTADOR } = Rol
const TODOS: readonly Rol[] = [ASESOR, JEFE, CONTADOR]

/** Acciones de la interfaz y los roles que pueden hacerlas (con su caso de uso). */
export const PERMISOS = {
  // Pantallas
  'ver.dashboard': [JEFE, CONTADOR], // CU-27
  'ver.reportes': [JEFE, CONTADOR], // CU-26
  'ver.facturacion': [JEFE, CONTADOR], // CU-25
  'ver.usuarios': [JEFE], // CU-03
  'ver.catalogosMaestros': [JEFE], // CU-14
  'ver.cotizaciones': TODOS, // CU-17
  'ver.ordenesCompra': TODOS, // CU-22
  'ver.clientes': TODOS,
  'ver.proveedores': TODOS,
  'ver.empresasMineras': TODOS,
  'ver.catalogo': TODOS, // CU-12

  // Acciones
  'clientes.gestionar': [ASESOR, JEFE], // CU-04
  'contactos.gestionar': [ASESOR, JEFE], // CU-05 y CU-08
  'empresasMineras.gestionar': [ASESOR], // CU-06
  'proveedores.gestionar': [JEFE], // CU-08
  'productos.gestionar': [JEFE], // CU-09 a CU-11
  'servicios.gestionar': [ASESOR], // CU-13
  'cotizaciones.gestionar': [ASESOR], // CU-15, CU-16 y CU-18
  'cotizaciones.adjuntos': [ASESOR, JEFE], // CU-19
  'ordenesCompra.gestionar': [JEFE], // CU-20 a CU-22
  'facturacion.gestionar': [CONTADOR], // CU-23 y CU-24
} as const satisfies Record<string, readonly Rol[]>

export type Permiso = keyof typeof PERMISOS

/** Normaliza el nombre del rol igual que el backend: "Jefe Administrativo" → "JEFE_ADMINISTRATIVO". */
export function normalizarRol(nombreRol: string | null | undefined): string {
  return (nombreRol ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function tienePermiso(nombreRol: string | null | undefined, permiso: Permiso): boolean {
  const rol = normalizarRol(nombreRol)
  return (PERMISOS[permiso] as readonly string[]).includes(rol)
}

/** Pantalla de inicio de cada rol: el Asesor no tiene tablero (CU-27), empieza en Cotizaciones. */
export function rutaInicio(nombreRol: string | null | undefined): string {
  return tienePermiso(nombreRol, 'ver.dashboard') ? '/dashboard' : '/cotizaciones'
}
