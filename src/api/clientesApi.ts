import { axiosClient } from './axiosClient'
import type { Cliente, ClienteRequest, FiltrosCliente } from '../types/cliente.types'
import type { PageResponse } from '@/types/common.types'

const RECURSO = '/clientes'
export const clientesApi = {
  listar: async (filtros: FiltrosCliente = {}): Promise<Cliente[]> => {
    const { data } = await axiosClient.get<PageResponse<Cliente> | Cliente[]>(RECURSO, { params: filtros })
    return Array.isArray(data) ? data : data.content ?? []
  },
  obtener: (id: number) => axiosClient.get<Cliente>(`${RECURSO}/${id}`).then((r) => r.data),
  crear: (data: ClienteRequest) => axiosClient.post<Cliente>(RECURSO, data).then((r) => r.data),
  actualizar: (id: number, data: ClienteRequest) => axiosClient.put<Cliente>(`${RECURSO}/${id}`, data).then((r) => r.data),
}
