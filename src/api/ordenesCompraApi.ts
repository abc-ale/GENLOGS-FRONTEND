import { axiosClient } from './axiosClient'
import type { PageResponse } from '@/types/common.types'
import type { OrdenCompra, OrdenCompraFiltros, OrdenCompraInput, EstadoOrdenCompra } from '@/types/ordenCompra.types'

export const ordenesCompraApi = {
  listar: async (filtros: OrdenCompraFiltros = {}): Promise<PageResponse<OrdenCompra>> => {
    const { data } = await axiosClient.get<PageResponse<OrdenCompra>>('/ordenes-compra', { params: filtros })
    return data
  },
  obtener: (id: number) => axiosClient.get<OrdenCompra>(`/ordenes-compra/${id}`).then((r) => r.data),
  crear: (data: OrdenCompraInput) => axiosClient.post<OrdenCompra>('/ordenes-compra', data).then((r) => r.data),
  cambiarEstado: (id: number, estado: EstadoOrdenCompra) =>
    axiosClient.patch<OrdenCompra>(`/ordenes-compra/${id}/estado`, { estado }).then((r) => r.data),
}
