const rutasPorRol: Record<string, string[]> = {
  ADMINISTRADOR: ['*'],
  VENDEDOR: [
    '/dashboard', '/cotizaciones', '/clientes', '/empresas-mineras',
    '/catalogo-repuestos', '/catalogo-servicios',
  ],
  COMPRAS: [
    '/dashboard', '/ordenes-compra', '/proveedores',
    '/catalogo-repuestos', '/catalogo-servicios',
  ],
  COMPRADOR: [
    '/dashboard', '/ordenes-compra', '/proveedores',
    '/catalogo-repuestos', '/catalogo-servicios',
  ],
  ALMACEN: ['/dashboard', '/ordenes-compra', '/catalogo-repuestos'],
  ALMACENERO: ['/dashboard', '/ordenes-compra', '/catalogo-repuestos'],
  ALMACENISTA: ['/dashboard', '/ordenes-compra', '/catalogo-repuestos'],
  LOGISTICA: ['/dashboard', '/ordenes-compra', '/proveedores', '/catalogo-repuestos'],
  CONTADOR: ['/dashboard', '/facturacion', '/reportes'],
  FINANZAS: ['/dashboard', '/facturacion', '/reportes'],
  SUPERVISOR: [
    '/dashboard', '/cotizaciones', '/ordenes-compra', '/clientes',
    '/proveedores', '/empresas-mineras', '/catalogo-repuestos',
    '/catalogo-servicios', '/facturacion', '/reportes',
  ],
  GERENTE_GENERAL: [
    '/dashboard', '/cotizaciones', '/ordenes-compra', '/clientes',
    '/proveedores', '/empresas-mineras', '/catalogo-repuestos',
    '/catalogo-servicios', '/facturacion', '/reportes',
  ],
}

function normalizarRol(rol: string | null | undefined): string {
  return (rol ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
}

export function puedeAccederA(rol: string | null | undefined, ruta: string): boolean {
  const rolNormalizado = normalizarRol(rol)
  if (ruta === '/' || ruta === '/dashboard') return true

  const rutasPermitidas = rutasPorRol[rolNormalizado] ?? []
  if (rutasPermitidas.includes('*')) return true

  return rutasPermitidas.some((prefijo) =>
    ruta === prefijo || ruta.startsWith(`${prefijo}/`),
  )
}

export function rutasVisibles(rol: string | null | undefined, rutas: string[]): string[] {
  return rutas.filter((ruta) => puedeAccederA(rol, ruta))
}
