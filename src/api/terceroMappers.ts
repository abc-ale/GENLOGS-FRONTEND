import type { Cliente, ClienteRequest } from '@/types/cliente.types'
import type { EmpresaMinera } from '@/types/empresaMinera.types'
import type { ContactoCliente, ContactoClienteRequest, Proveedor, ProveedorRequest } from '@/types/proveedor.types'
import type { ContactoTercero, Tercero, TipoDocumento } from '@/types/tercero.types'

/**
 * El backend responde de dos formas distintas según el endpoint:
 *  - GET /clientes y GET /proveedores devuelven la ENTIDAD (tercero anidado,
 *    tipoDocumento y distrito como objetos).
 *  - GET/POST/PUT /clientes/{id} devuelven ClienteResponse PLANO
 *    (razonSocial, numeroDocumento, tipoDocumento como texto, etc.).
 * Estos mapeadores aceptan ambas y devuelven el modelo que usan los componentes.
 */

type Raw = Record<string, unknown>

const rec = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {})
const str = (v: unknown): string | null => (typeof v === 'string' ? v : null)
const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}
/** "" -> undefined, para no mandar cadenas vacías a campos opcionales del backend. */
const vacio = (s?: string | null): string | undefined => (s && s.trim() ? s.trim() : undefined)

export function normalizarTercero(raw: unknown): Tercero {
  const t = rec(raw)
  const td = t.tipoDocumento
  const numeroDocumento = str(t.numeroDocumento) ?? ''
  const codigoRecibido = typeof td === 'string' ? td : str(rec(td).codigoTipo)
  // Si el backend no manda el tipo, se deduce por la longitud del documento.
  const codigo = (codigoRecibido ??
    (numeroDocumento.length === 11 ? 'RUC' : numeroDocumento.length === 8 ? 'DNI' : 'CE')) as TipoDocumento
  const distrito = rec(t.distrito)
  const correo = str(t.correo)

  return {
    idTercero: num(t.idTercero),
    idTipoDocumento: num(t.idTipoDocumento ?? rec(td).idTipoDocumento),
    idDistrito: num(t.idDistrito ?? distrito.idDistrito),
    numeroDocumento,
    razonSocial: str(t.razonSocial) ?? '',
    direccion: str(t.direccion),
    telefono: str(t.telefono),
    correo,
    status: t.status === 'I' ? 'I' : 'A',
    tipoDocumentoCodigo: codigo,
    tipoDocumento: codigo,
    nombreComercial: null,
    email: correo,
    distritoNombre: str(distrito.nombreDistrito) ?? undefined,
  }
}

export function normalizarContacto(raw: unknown): ContactoTercero {
  const c = rec(raw)
  const esPrincipal = c.esPrincipal === true
  const nombres = str(c.nombres) ?? ''
  const correo = str(c.correo)
  return {
    idContacto: num(c.idContacto),
    id: num(c.idContacto),
    idTercero: num(c.idTercero),
    nombres,
    nombre: nombres,
    cargo: str(c.cargo),
    correo,
    email: correo,
    telefono: str(c.telefono),
    esPrincipal,
    principal: esPrincipal,
    status: c.status === 'I' ? 'I' : 'A',
  }
}

export function normalizarEmpresaMinera(raw: unknown): EmpresaMinera {
  const e = rec(raw)
  const nombre = str(e.nombreUnidadMinera) ?? ''
  const idCliente = num(e.idCliente ?? rec(e.cliente).idCliente)
  return {
    idEmpresaMinera: num(e.idEmpresaMinera),
    id: num(e.idEmpresaMinera),
    idCliente,
    clienteId: idCliente,
    idEtapaComercial: num(e.idEtapaComercial ?? rec(e.etapaComercial).idEtapaComercial),
    idTipoOperacion: num(e.idTipoOperacion ?? rec(e.tipoOperacion).idTipoOperacion),
    nombreUnidadMinera: nombre,
    nombre,
    latitud: num(e.latitud),
    longitud: num(e.longitud),
    altitudMsnm: e.altitudMsnm == null ? null : num(e.altitudMsnm),
    capacidadProduccion: str(e.capacidadProduccion),
    descripcion: str(e.descripcion),
    status: e.status === 'I' ? 'I' : 'A',
    minerales: [],
  }
}

export function normalizarCliente(
  raw: unknown,
  contactos: ContactoCliente[] = [],
  empresasMineras: EmpresaMinera[] = [],
): Cliente {
  const c = rec(raw)
  const anidado = rec(c.tercero)
  // Entidad: los datos del tercero vienen en c.tercero. Respuesta plana: vienen en c.
  const tercero = normalizarTercero(Object.keys(anidado).length > 0 ? anidado : c)
  const idCliente = num(c.idCliente)
  return {
    idCliente,
    id: idCliente,
    idTercero: tercero.idTercero,
    idSectorEconomico: num(c.idSectorEconomico ?? rec(c.sectorEconomico).idSectorEconomico),
    situacion: str(c.situacion) ?? 'ACTIVO',
    status: c.status === 'I' ? 'I' : 'A',
    tercero,
    contactos,
    empresasMineras,
  }
}

export function normalizarProveedor(raw: unknown, contactos: ContactoCliente[] = []): Proveedor {
  const p = rec(raw)
  const tercero = normalizarTercero(Object.keys(rec(p.tercero)).length > 0 ? p.tercero : p)
  const idProveedor = num(p.idProveedor)
  return {
    idProveedor,
    id: idProveedor,
    idTercero: tercero.idTercero,
    situacion: str(p.situacion) ?? 'ACTIVO',
    status: p.status === 'I' ? 'I' : 'A',
    tercero,
    contactos,
  }
}

// ---------------------------------------------------------------------
// Payloads: del formulario (tercero anidado) a lo que espera el backend (plano)
// ---------------------------------------------------------------------

export function aClientePayload(d: ClienteRequest) {
  const t = d.tercero
  return {
    idTipoDocumento: t.idTipoDocumento,
    numeroDocumento: t.numeroDocumento.trim(),
    razonSocial: t.razonSocial.trim(),
    idDistrito: t.idDistrito,
    direccion: vacio(t.direccion),
    telefono: vacio(t.telefono),
    correo: vacio(t.correo),
    idSectorEconomico: d.idSectorEconomico,
  }
}

export function aProveedorPayload(d: ProveedorRequest) {
  const t = d.tercero
  return {
    idTipoDocumento: t.idTipoDocumento,
    numeroDocumento: t.numeroDocumento.trim(),
    razonSocial: t.razonSocial.trim(),
    idDistrito: t.idDistrito,
    direccion: vacio(t.direccion),
    telefono: vacio(t.telefono),
    correo: vacio(t.correo),
  }
}

export function aContactoPayload(d: ContactoClienteRequest) {
  return {
    nombres: (d.nombres ?? d.nombre ?? '').trim(),
    cargo: vacio(d.cargo),
    correo: vacio(d.correo ?? d.email),
    telefono: vacio(d.telefono),
    esPrincipal: d.esPrincipal ?? d.principal ?? false,
  }
}