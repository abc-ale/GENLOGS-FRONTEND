import { useQuery } from "@tanstack/react-query"
import {
  obtenerIndicadores,
  obtenerFacturacionHistorico,
  obtenerCotizacionesPorEstado,
} from "@/api/dashboardApi"
import type {
  DashboardIndicadoresResponse,
  FacturacionHistoricoItem,
  CotizacionEstadoItem,
  DashboardFiltros,
  FacturacionPeriodo,
} from "@/types/dashboard.types"

const emptyIndicadores: DashboardIndicadoresResponse = {
  totalFacturado: 0,
  cotizacionesPendientes: 0,
  clientesActivos: 0,
  ordenesCompraProceso: 0,
  porcentajeVariacionFacturacion: 0,
}

export function useIndicadores(filtros: DashboardFiltros = {}) {
  return useQuery<DashboardIndicadoresResponse, Error>({
    queryKey: ["dashboard-indicadores", filtros],
    queryFn: () => obtenerIndicadores(filtros),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    placeholderData: emptyIndicadores,
  })
}

export function useFacturacionHistorico(periodo: FacturacionPeriodo = "mensual") {
  return useQuery<FacturacionHistoricoItem[], Error>({
    queryKey: ["dashboard-facturacion-historico", periodo],
    queryFn: () => obtenerFacturacionHistorico(periodo),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  })
}

export function useCotizacionesPorEstado() {
  return useQuery<CotizacionEstadoItem[], Error>({
    queryKey: ["dashboard-cotizaciones-estado"],
    queryFn: () => obtenerCotizacionesPorEstado(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  })
}

export function useDashboardData(filtros: DashboardFiltros = {}, periodo: FacturacionPeriodo = "mensual") {
  const indicadores = useIndicadores(filtros)
  const facturacionHistorico = useFacturacionHistorico(periodo)
  const cotizacionesPorEstado = useCotizacionesPorEstado()

 const isLoading = indicadores.isLoading || facturacionHistorico.isLoading || cotizacionesPorEstado.isLoading
  const isError = indicadores.isError || facturacionHistorico.isError || cotizacionesPorEstado.isError
  const error = indicadores.error || facturacionHistorico.error || cotizacionesPorEstado.error

  return {
    indicadores: indicadores.data ?? emptyIndicadores,
    facturacionHistorico: facturacionHistorico.data ?? [],
    cotizacionesPorEstado: cotizacionesPorEstado.data ?? [],
    isLoading,
    isError,
    error,
    refetch: () => {
      indicadores.refetch()
      facturacionHistorico.refetch()
      cotizacionesPorEstado.refetch()
    },
  }
}