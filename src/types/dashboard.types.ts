export interface DashboardIndicadoresResponse {
  totalFacturado: number
  cotizacionesPendientes: number
  clientesActivos: number
  ordenesCompraProceso: number
  porcentajeVariacionFacturacion: number
}

export interface FacturacionHistoricoItem {
  mes: string
  monto: number
  comparativaAnoAnterior?: number
}

export type FacturacionPeriodo = "mensual" | "trimestral" | "anual"

export interface CotizacionEstadoItem {
  estado: string
  cantidad: number
  porcentaje: number
}

export interface DashboardFiltros {
  desde?: string
  hasta?: string
}