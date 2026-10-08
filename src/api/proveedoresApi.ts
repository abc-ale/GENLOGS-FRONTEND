import { axiosClient } from './axiosClient'
import type { Proveedor, ProveedorRequest } from '../types/proveedor.types'
import type { PageResponse } from '@/types/common.types'

export const proveedoresApi = {
  listar: async (): Promise<Proveedor[]> => {
    const { data } = await axiosClient.get<PageResponse<Proveedor> | Proveedor[]>('/proveedores')
    return Array.isArray(data) ? data : data.content ?? []
  },
  crear: (data: ProveedorRequest) => axiosClient.post<Proveedor>('/proveedores', data).then((r) => r.data),
  actualizar: (id: number, data: ProveedorRequest) => axiosClient.put<Proveedor>(`/proveedores/${id}`, data).then((r) => r.data),
}
