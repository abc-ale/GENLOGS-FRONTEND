import { axiosClient } from './axiosClient'
import type { PageResponse } from '@/types/common.types'
import type {
  CondicionPagoCatalogo,
  DetalleFacturacion,
  EstadoFacturacion,
  Factura,
  FacturaInput,
  FacturacionFiltros,
  MonedaCatalogo,
  TipoComprobanteCatalogo,
} from '@/types/facturacion.types'

export const facturacionApi = {
  listar: async (filtros: FacturacionFiltros = {}): Promise<PageResponse<Factura>> => {
    const { data } = await axiosClient.get<PageResponse<Factura>>('/facturacion', { params: filtros })
    return data
  },
  obtener: (id: number) => axiosClient.get<Factura>(`/facturacion/${id}`).then((r) => r.data),
  listarDetalle: (id: number) => axiosClient.get<DetalleFacturacion[]>(`/facturacion/${id}/detalle`).then((r) => r.data),
  crear: (data: FacturaInput) => axiosClient.post<Factura>('/facturacion', data).then((r) => r.data),
  cambiarEstado: (id: number, estado: EstadoFacturacion) =>
    axiosClient.patch<Factura>(`/facturacion/${id}/estado`, { codigoEstado: estado }).then((r) => r.data),
  enviarSunat: (id: number) => axiosClient.post<Factura>(`/facturacion/${id}/enviar-sunat`).then((r) => r.data),
  anular: (id: number, motivo: string) => axiosClient.post<Factura>(`/facturacion/${id}/anular`, { motivo }).then((r) => r.data),
  descargarPdf: (id: number) => axiosClient.get<Blob>(`/facturacion/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
  // Catálogos que pide el registro de la facturación (CU-23).
  listarTiposComprobante: () =>
    axiosClient.get<TipoComprobanteCatalogo[]>('/tipos-comprobante').then((r) => r.data),
  listarMonedas: () => axiosClient.get<MonedaCatalogo[]>('/catalogos/monedas').then((r) => r.data),
  listarCondicionesPago: () =>
    axiosClient.get<CondicionPagoCatalogo[]>('/catalogos/condiciones-pago').then((r) => r.data),
}