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

export interface ReporteVistaPrevia {
  tipoReporte: TipoReporte
  encabezados: string[]
  filas: string[][]
  /** Total de filas que tendrá el reporte completo. */
  totalFilas: number
  /** true si solo se devuelven las primeras filas. */
  truncado: boolean
}