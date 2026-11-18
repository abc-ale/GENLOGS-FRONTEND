export const TipoComprobante = { FACTURA: 'FACTURA', BOLETA: 'BOLETA', NOTA_CREDITO: 'NOTA_CREDITO', NOTA_DEBITO: 'NOTA_DEBITO' } as const
export type TipoComprobante = (typeof TipoComprobante)[keyof typeof TipoComprobante]
export const EstadoFacturacion = { EMITIDA: 'EMITIDA', PARCIAL: 'PARCIAL', PAGADA: 'PAGADA', VENCIDA: 'VENCIDA', ANULADA: 'ANULADA' } as const
export type EstadoFacturacion = (typeof EstadoFacturacion)[keyof typeof EstadoFacturacion]
export interface TipoComprobanteCatalogo { idTipoComprobante: number; codigoTipo: TipoComprobante; nombreTipo: string; seriePrefijo: string; requiereRuc: boolean }
export interface EstadoFacturacionCatalogo { idEstadoFacturacion: number; codigoEstado: EstadoFacturacion; nombreEstado: string; esFinal: boolean }
export interface DetalleFacturacion { idDetalleFacturacion: number; idFacturacion?: number; idProducto?: number | null; productoNombre?: string | null; idServicio?: number | null; servicioNombre?: string | null; descripcionPersonalizada?: string | null; cantidad: number; precioUnitario: number; descuentoUnitario: number; importeLinea: number }
export interface Factura {
  idFacturacion: number
  id?: number
  idOrdenCompra: number
  idTipoComprobante: number
  idEstadoFacturacion: number
  idCondicionPago: number
  idMoneda: number
  serieComprobante: string
  serie?: string
  numeroComprobante: string
  numero?: string
  codigoComprobante: string
  fechaEmision: string
  fechaVencimiento: string
  montoPagado: number
  observaciones?: string | null
  tipoComprobante?: TipoComprobante
  estadoCodigo?: EstadoFacturacion
  numeroOrdenCompra?: string
  cliente?: string
  clienteRazonSocial?: string
  clienteNombre?: string
  clienteId?: number
  tipo?: TipoComprobante
  moneda?: string
  estado?: EstadoFacturacion
  subtotal?: number
  igv?: number
  total: number
  saldoPendiente?: number
  detalles?: DetalleFacturacion[]
}
/** Línea de la facturación: exactamente uno de idProducto o idServicio. */
export interface LineaFacturaInput { idProducto?: number; idServicio?: number; descripcionPersonalizada?: string; cantidad: number; precioUnitario: number; descuentoUnitario?: number }
export interface FacturaInput { idOrdenCompra: number; idTipoComprobante: number; idCondicionPago: number; idMoneda: number; serieComprobante: string; numeroComprobante: string; fechaEmision?: string; fechaVencimiento?: string; lineas: LineaFacturaInput[] }
export interface MonedaCatalogo { idMoneda: number; codigoMoneda: string; nombreMoneda: string; simbolo: string }
export interface CondicionPagoCatalogo { idCondicionPago: number; nombreCondicion: string; diasCredito?: number | null }
export interface FacturacionFiltros { estadoCodigo?: EstadoFacturacion; tipoCodigo?: TipoComprobante; idOrdenCompra?: number; page?: number; size?: number }