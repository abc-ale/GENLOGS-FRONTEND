import type { PageResponse } from './common.types'
export const EstadoOrdenCompra = { RECIBIDA: 'RECIBIDA', EN_ATENCION: 'EN_ATENCION', ATENDIDA: 'ATENDIDA', ANULADA: 'ANULADA' } as const
export type EstadoOrdenCompra = (typeof EstadoOrdenCompra)[keyof typeof EstadoOrdenCompra]
export interface OrdenCompra {
  idOrdenCompra: number
  id?: number
  idCotizacion: number
  idEstadoOrdenCompra: number
  idCondicionPago: number
  numeroOrdenCompra: string
  numero?: string
  fechaEmisionCliente?: string | null
  fechaRecepcion: string
  fechaEmision?: string
  urlArchivo?: string | null
  observaciones?: string | null
  estadoCodigo?: EstadoOrdenCompra
  codigoCotizacion?: string
  cliente?: string
  clienteNombre?: string
  clienteId?: number
  moneda?: string
  total: number
  estado?: string
}
export interface OrdenCompraInput { idCotizacion: number; idEstadoOrdenCompra?: number; idCondicionPago: number; numeroOrdenCompra: string; fechaEmisionCliente?: string; fechaRecepcion?: string; urlArchivo?: string; observaciones?: string }
export interface OrdenCompraFiltros { estadoCodigo?: EstadoOrdenCompra; idCotizacion?: number; page?: number; size?: number }
export type OrdenesCompraPage = PageResponse<OrdenCompra>
