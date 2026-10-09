import { axiosClient } from "@/api/axiosClient"
import type { CrearCotizacionFormData } from "@/lib/validators/cotizacion.schema"
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

  /** Arma el cuerpo que realmente espera el backend (ids de catálogo + lineas)
   *  a partir de los datos del formulario y normaliza la respuesta. */
  async crearDesdeFormulario(form: CrearCotizacionFormData): Promise<Cotizacion> {
    const [monedas, condiciones] = await Promise.all([
      axiosClient.get<Array<{ idMoneda: number; codigoMoneda: string }>>("/catalogos/monedas").then((r) => r.data),
      axiosClient.get<Array<{ idCondicionPago: number; diasCredito: number }>>("/catalogos/condiciones-pago").then((r) => r.data),
    ])
    const moneda = monedas.find((m) => m.codigoMoneda === form.moneda)
    const dias = form.condicionPago === "CONTADO" ? 0 : Number(String(form.condicionPago).replace(/\D/g, ""))
    const condicion = condiciones.find((c) => Number(c.diasCredito) === dias)
    if (!moneda) throw new Error(`La moneda ${form.moneda} no existe en el catálogo`)
    if (!condicion) throw new Error("La condición de pago elegida no existe en el catálogo")

    const body = {
      idCliente: form.clienteId,
      idMoneda: moneda.idMoneda,
      idCondicionPago: condicion.idCondicionPago,
      observaciones: form.observaciones || undefined,
      lineas: form.detalles.map((d) => ({
        idProducto: d.idProducto,
        idUnidadMedida: d.idUnidadMedida,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        descuentoUnitario: 0,
      })),
    }
    const { data } = await axiosClient.post<Record<string, unknown>>("/cotizaciones", body)
    return {
      ...data,
      id: data.idCotizacion,
      codigo: data.codigoCotizacion,
      total: Number(data.total ?? 0),
    } as unknown as Cotizacion
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