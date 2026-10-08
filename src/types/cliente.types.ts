import type { EmpresaMinera } from './empresaMinera.types'
import type { ContactoTercero, Tercero, TerceroInput } from './tercero.types'

export interface Cliente {
  idCliente: number
  /** Alias de lectura para componentes antiguos; el ID canónico es idCliente. */
  id: number
  idTercero: number
  idSectorEconomico: number
  situacion: string
  status: 'A' | 'I'
  tercero: Tercero
  contactos: ContactoTercero[]
  empresasMineras: EmpresaMinera[]
}

export interface ClienteInput {
  tercero: TerceroInput
  idSectorEconomico: number
  situacion?: string
}
export type ClienteRequest = ClienteInput
export interface FiltrosCliente { documento?: string; razonSocial?: string; idSectorEconomico?: number; situacion?: string; page?: number; size?: number }
