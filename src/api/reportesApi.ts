import { axiosClient } from "./axiosClient"
import type { ReporteRequest, ReporteVistaPrevia } from "@/types/reporte.types"

export async function generarReporte(request: ReporteRequest): Promise<Blob> {
  const { data } = await axiosClient.post("/reportes/generar", request, {
    responseType: "blob",
  })
  return data
}

export async function obtenerVistaPrevia(request: ReporteRequest): Promise<ReporteVistaPrevia> {
  const { data } = await axiosClient.post<ReporteVistaPrevia>("/reportes/vista-previa", request)
  return data
}

export function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}