import { useQuery } from "@tanstack/react-query"
import { obtenerIndicadores } from "@/api/dashboardApi"
import type { DashboardFiltros } from "@/types/dashboard.types"

export function useIndicadores(filtros: DashboardFiltros = {}) {
  return useQuery({
    queryKey: ["dashboard-indicadores", filtros],
    queryFn: () => obtenerIndicadores(filtros),
    staleTime: 60_000,
  })
}
