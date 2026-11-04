import { useMutation } from "@tanstack/react-query"
import { obtenerVistaPrevia } from "@/api/reportesApi"
import type { ReporteRequest } from "@/types/reporte.types"

export function useVistaPreviaReporte() {
  return useMutation({
    mutationFn: (request: ReporteRequest) => obtenerVistaPrevia(request),
  })
}