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

function normalizarCotizacionApi(raw: Record<string, unknown>): Cotizacion {
  const estado = String(raw.estadoCodigo ?? raw.estadoCotizacion ?? raw.estado ?? "BORRADOR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
  const monedaOriginal = String(raw.monedaCodigo ?? raw.moneda ?? "PEN").trim().toUpperCase()
  const moneda = monedaOriginal === "S/" || monedaOriginal === "S/." || monedaOriginal === "SOL" ? "PEN"
    : monedaOriginal === "$" || monedaOriginal === "US$" ? "USD"
      : monedaOriginal === "€" ? "EUR" : monedaOriginal
  const fecha = String(raw.fechaCotizacion ?? raw.fechaCreacion ?? "")

  return {
    ...raw,
    idCotizacion: Number(raw.idCotizacion ?? raw.id ?? 0),
    id: Number(raw.idCotizacion ?? raw.id ?? 0),
    codigoCotizacion: String(raw.codigoCotizacion ?? raw.codigo ?? ""),
    codigo: String(raw.codigoCotizacion ?? raw.codigo ?? ""),
    clienteNombre: String(raw.clienteRazonSocial ?? raw.clienteNombre ?? raw.cliente ?? ""),
    cliente: String(raw.clienteRazonSocial ?? raw.clienteNombre ?? raw.cliente ?? ""),
    fechaCotizacion: fecha,
    fechaCreacion: fecha,
    estadoCotizacion: estado as Cotizacion["estadoCotizacion"],
    estadoCodigo: estado as Cotizacion["estadoCotizacion"],
    moneda: moneda as Cotizacion["moneda"],
    subtotal: Number(raw.subtotal ?? 0),
    igv: Number(raw.igv ?? 0),
    total: Number(raw.total ?? 0),
    detalles: Array.isArray(raw.detalles) ? raw.detalles as Cotizacion["detalles"] : [],
  } as unknown as Cotizacion
}
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
    params.append("sortBy", filtros?.sortBy === "fechaCreacion" ? "fechaCotizacion" : (filtros?.sortBy ?? "fechaCotizacion"))
    params.append("sortDir", filtros?.sortDir ?? "DESC")

    const response = await axiosClient.get<Record<string, unknown>>("/cotizaciones", { params })
    const pagina = response.data
    const elementos = Array.isArray(pagina.content) ? pagina.content as Record<string, unknown>[] : []
    return {
      content: elementos.map(normalizarCotizacionApi),
      totalElements: Number(pagina.totalElements ?? 0),
      totalPages: Number(pagina.totalPages ?? 0),
      currentPage: Number(pagina.page ?? pagina.currentPage ?? 0),
      pageSize: Number(pagina.size ?? pagina.pageSize ?? 10),
    }
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
    const response = await axiosClient.patch<Cotizacion>(`/cotizaciones/${id}/estado`, { codigoEstado: data.estadoNuevo ?? data.idEstadoCotizacion, comentario: data.comentario ?? data.observaciones })
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