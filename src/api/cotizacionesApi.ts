import { axiosClient } from "@/api/axiosClient"
import type {
  Cotizacion,
  CreateCotizacionRequest,
  CotizacionesListResponse,
  CotizacionesFilterParams,
  UpdateEstadoCotizacionRequest,
  EnviarCotizacionRequest,
  AdjuntoCotizacion,
} from "@/types/cotizacion.types"

export const cotizacionesApi = {
  async listarCotizaciones(
    filtros?: CotizacionesFilterParams
  ): Promise<CotizacionesListResponse> {
    const params = new URLSearchParams()

    if (filtros?.estadoCotizacion) {
      params.append("estadoCotizacion", filtros.estadoCotizacion)
    }
    if (filtros?.clienteId) {
      params.append("clienteId", String(filtros.clienteId))
    }
    if (filtros?.moneda) {
      params.append("moneda", filtros.moneda)
    }

    params.append("page", String(filtros?.page ?? 0))
    params.append("size", String(filtros?.size ?? 10))
    params.append("sortBy", filtros?.sortBy ?? "fechaCreacion")
    params.append("sortDir", filtros?.sortDir ?? "DESC")

    const response = await axiosClient.get<CotizacionesListResponse>("/cotizaciones", { params })
    return response.data
  },

  async obtenerCotizacion(id: number): Promise<Cotizacion> {
    const response = await axiosClient.get<Cotizacion>(`/cotizaciones/${id}`)
    return response.data
  },

  async crearCotizacion(data: CreateCotizacionRequest): Promise<Cotizacion> {
    const response = await axiosClient.post<Cotizacion>("/cotizaciones", data)
    return response.data
  },

  async cambiarEstadoCotizacion(
    id: number,
    data: UpdateEstadoCotizacionRequest
  ): Promise<Cotizacion> {
    const response = await axiosClient.put<Cotizacion>(`/cotizaciones/${id}/estado`, data)
    return response.data
  },

  async cargarAdjunto(cotizacionId: number, archivo: File): Promise<AdjuntoCotizacion> {
    const formData = new FormData()
    formData.append("archivo", archivo)

    const response = await axiosClient.post<AdjuntoCotizacion>(
      `/cotizaciones/${cotizacionId}/adjuntos`,
      formData
    )
    return response.data
  },

  async eliminarAdjunto(cotizacionId: number, adjuntoId: number): Promise<void> {
    await axiosClient.delete(`/cotizaciones/${cotizacionId}/adjuntos/${adjuntoId}`)
  },

  async enviarCotizacion(
    id: number,
    data: EnviarCotizacionRequest
  ): Promise<{ success: boolean; mensaje: string }> {
    const response = await axiosClient.post<{ success: boolean; mensaje: string }>(
      `/cotizaciones/${id}/enviar`,
      data
    )
    return response.data
  },

  async descargarCotizacionPDF(id: number): Promise<Blob> {
    const response = await axiosClient.get(`/cotizaciones/${id}/descargar-pdf`, {
      responseType: "blob",
    })
    return response.data
  },

  async duplicarCotizacion(id: number): Promise<Cotizacion> {
    const response = await axiosClient.post<Cotizacion>(`/cotizaciones/${id}/duplicar`)
    return response.data
  },

  async obtenerEstadisticas(): Promise<{
    totalCotizaciones: number
    totalPorEstado: Record<string, number>
    montoTotalPendiente: number
    tasaAprobacion: number
  }> {
    const response = await axiosClient.get("/cotizaciones/estadisticas")
    return response.data
  },
}