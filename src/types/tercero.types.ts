export const TipoDocumento = { DNI: 'DNI', RUC: 'RUC', CE: 'CE', PAS: 'PAS' } as const
export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento]

export interface Tercero {
  idTercero: number
  idTipoDocumento: number
  idDistrito: number
  numeroDocumento: string
  razonSocial: string
  direccion?: string | null
  telefono?: string | null
  correo?: string | null
  status: 'A' | 'I'
  tipoDocumentoCodigo?: TipoDocumento
  /** Alias de lectura permitido por el DTO del backend; no es columna SQL. */
  tipoDocumento: TipoDocumento
  nombreComercial: string | null
  email: string | null
  distritoNombre?: string
}

export interface TerceroInput {
  idTipoDocumento: number
  idDistrito: number
  numeroDocumento: string
  razonSocial: string
  direccion?: string
  telefono?: string
  correo?: string
}

export interface ContactoTercero {
  idContacto: number
  id?: number
  idTercero: number
  nombres: string
  nombre?: string
  cargo?: string | null
  correo?: string | null
  email?: string | null
  telefono?: string | null
  esPrincipal: boolean
  principal?: boolean
  status: 'A' | 'I'
}

export type ContactoTerceroInput = { nombres?: string; nombre?: string; cargo?: string; correo?: string; email?: string; telefono?: string; esPrincipal?: boolean; principal?: boolean }
