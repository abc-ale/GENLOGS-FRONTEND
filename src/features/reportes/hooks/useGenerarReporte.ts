import { useMutation } from "@tanstack/react-query"
import { generarReporte, descargarBlob } from "@/api/reportesApi"
import type { ReporteRequest } from "@/types/reporte.types"

const NOMBRES_TIPO: Record<ReporteRequest["tipoReporte"], string> = {
  COTIZACIONES: "cotizaciones",
  ORDENES_COMPRA: "ordenes-compra",
  FACTURACION: "facturacion",
  SERVICIOS: "servicios",
  PRODUCTOS: "productos",
}

export function useGenerarReporte() {
  return useMutation({
    mutationFn: async (request: ReporteRequest) => {
      const blob = await generarReporte(request)
      const extension = request.formato === "EXCEL" ? "xlsx" : "pdf"
      // Incluye el rango para distinguir descargas sucesivas del mismo tipo
      const nombreArchivo = `reporte-${NOMBRES_TIPO[request.tipoReporte]}-${request.fechaInicio}_${request.fechaFin}.${extension}`
      descargarBlob(blob, nombreArchivo)
    },
  })
}
