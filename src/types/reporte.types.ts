export type TipoReporte =
  | "COTIZACIONES"
  | "ORDENES_COMPRA"
  | "FACTURACION"
  | "SERVICIOS"
  | "PRODUCTOS"

export type FormatoReporte = "PDF" | "EXCEL"

export interface ReporteRequest {
  tipoReporte: TipoReporte
  fechaInicio: string
  fechaFin: string
  formato: FormatoReporte
}