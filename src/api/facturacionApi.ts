import { axiosClient } from './axiosClient'
import type { PageResponse } from '@/types/common.types'
import type { Factura, FacturaInput, FacturacionFiltros } from '@/types/facturacion.types'

export const facturacionApi = {
  listar: async (filtros: FacturacionFiltros = {}): Promise<PageResponse<Factura>> => {
    const { data } = await axiosClient.get<PageResponse<Factura>>('/facturacion', { params: filtros })
    return data
  },
  obtener: (id: number) => axiosClient.get<Factura>(`/facturacion/${id}`).then((r) => r.data),
  crear: (data: FacturaInput) => axiosClient.post<Factura>('/facturacion', data).then((r) => r.data),
  enviarSunat: (id: number) => axiosClient.post<Factura>(`/facturacion/${id}/enviar-sunat`).then((r) => r.data),
  anular: (id: number, motivo: string) => axiosClient.post<Factura>(`/facturacion/${id}/anular`, { motivo }).then((r) => r.data),
  descargarPdf: (id: number) => axiosClient.get<Blob>(`/facturacion/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
}
