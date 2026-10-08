import { axiosClient } from "./axiosClient"
import type {
  DashboardIndicadoresResponse,
  FacturacionHistoricoItem,
  FacturacionPeriodo,
  CotizacionEstadoItem,
  DashboardFiltros,
} from "@/types/dashboard.types"

export async function obtenerIndicadores(
  filtros: DashboardFiltros = {}
): Promise<DashboardIndicadoresResponse> {
  const { data } = await axiosClient.get<DashboardIndicadoresResponse>(
    "/dashboard/indicadores",
    { params: filtros }
  )
  return data
}

export async function obtenerFacturacionHistorico(
  periodo: FacturacionPeriodo = "mensual"
): Promise<FacturacionHistoricoItem[]> {
  const { data } = await axiosClient.get<FacturacionHistoricoItem[]>(
    "/dashboard/graficos/facturacion",
    { params: { periodo } }
  )
  return data
}

export async function obtenerCotizacionesPorEstado(): Promise<CotizacionEstadoItem[]> {
  const { data } = await axiosClient.get<CotizacionEstadoItem[]>(
    "/dashboard/graficos/cotizaciones-estado"
  )
  return data
}