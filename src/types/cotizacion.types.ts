export const EstadoCotizacion = { BORRADOR: 'BORRADOR', ENVIADA: 'ENVIADA', EN_NEGOCIACION: 'EN_NEGOCIACION', APROBADA: 'APROBADA', RECHAZADA: 'RECHAZADA', VENCIDA: 'VENCIDA', ANULADA: 'ANULADA', CADUCADA: 'VENCIDA' } as const
export type EstadoCotizacion = (typeof EstadoCotizacion)[keyof typeof EstadoCotizacion]
export const CondicionPago = { CONTADO: 'CONTADO', CREDITO_15: 'CREDITO_15', CREDITO_30: 'CREDITO_30', CREDITO_45: 'CREDITO_45', CREDITO_60: 'CREDITO_60' } as const
export type CondicionPago = (typeof CondicionPago)[keyof typeof CondicionPago]
export const Moneda = { PEN: 'PEN', USD: 'USD', EUR: 'EUR' } as const
export type Moneda = (typeof Moneda)[keyof typeof Moneda]

export interface CotizacionDetalle {
  idCotizacionDetalle?: number
  idCotizacion?: number
  idProducto?: number | null
  idServicio?: number | null
  idUnidadMedida: number
  descripcionPersonalizada?: string | null
  cantidad: number
  precioUnitario: number
  descuentoUnitario: number
  importeLinea?: number
  id?: number
  producto?: string
  servicio?: string
  subtotal: number
  margenPorcentaje?: number
  descripcion?: string
}
export interface AdjuntoCotizacion { idAdjunto?: number; id?: number; idCotizacion?: number; nombreArchivo: string; urlArchivo: string; urlCloudinary: string; tipoArchivo: string; tamanio: number; fechaSubida?: string; subidoPor: string }
export interface SeguimientoCotizacion { idSeguimiento?: number; id?: number; idCotizacion?: number; idEstadoCotizacion: number; estadoCodigo?: EstadoCotizacion; estadoAnterior: EstadoCotizacion; estadoNuevo: EstadoCotizacion; fechaEvento: string; fecha: string; idUsuario?: number; usuarioNombre?: string; comentario?: string; observaciones: string }

/** Modelo canónico de cotizacion; los campos de presentación provienen de las vistas V8. */
export interface Cotizacion {
  idCotizacion?: number
  id?: number
  idCliente: number
  idContacto?: number | null
  idUsuarioVendedor?: number
  idEstadoCotizacion?: number
  idMoneda: number
  idCondicionPago: number
  idSectorEconomico?: number | null
  codigoCotizacion: string
  codigo?: string
  fechaCotizacion: string
  fechaValidez: string
  fechaCreacion?: string
  observaciones: string | null
  estadoCodigo?: EstadoCotizacion
  estadoCotizacion: EstadoCotizacion
  monedaCodigo?: Moneda
  moneda: Moneda
  condicionPago: CondicionPago | string
  cliente?: string
  clienteNombre?: string
  clienteEmail?: string
  subtotal: number
  igv: number
  total: number
  detalles: CotizacionDetalle[]
  seguimientos?: SeguimientoCotizacion[]
  adjuntos?: AdjuntoCotizacion[]
}
export interface CreateCotizacionRequest { idCliente?: number; clienteId?: number; idContacto?: number | null; idUsuarioVendedor?: number; idEstadoCotizacion?: number; idMoneda?: number; idCondicionPago?: number; moneda?: Moneda; condicionPago?: CondicionPago; idSectorEconomico?: number | null; codigoCotizacion?: string; fechaCotizacion?: string; fechaValidez?: string; observaciones?: string; detalles: CreateCotizacionDetalleRequest[] }
export interface CreateCotizacionDetalleRequest { idProducto?: number; idServicio?: number; idUnidadMedida?: number; producto?: string; servicio?: string; descripcionPersonalizada?: string; descripcion?: string; cantidad: number; precioUnitario: number; descuentoUnitario?: number; margenPorcentaje?: number }
export interface UpdateEstadoCotizacionRequest { idEstadoCotizacion?: number; estadoNuevo?: EstadoCotizacion; comentario?: string; observaciones?: string }
export interface CotizacionesListResponse { content: Cotizacion[]; totalElements: number; totalPages: number; currentPage: number; pageSize: number }
export interface CotizacionesFilterParams { estadoCodigo?: EstadoCotizacion; estadoCotizacion?: EstadoCotizacion; idCliente?: number; clienteId?: number; idMoneda?: number; moneda?: Moneda; page?: number; size?: number; sortBy?: string; sortDir?: 'ASC' | 'DESC' }
export interface EnviarCotizacionRequest { correoDestinatario: string; asunto: string; mensaje: string; incluirDetalles: boolean }
