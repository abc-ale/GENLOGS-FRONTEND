import { axiosClient } from './axiosClient'
import type { Proveedor, ProveedorRequest } from '../types/proveedor.types'
import {
  aProveedorPayload,
  normalizarProveedor,
} from './terceroMappers'

const RECURSO = '/proveedores'

export const proveedoresApi = {
  listar: async (): Promise<Proveedor[]> => {
    const { data } = await axiosClient.get<unknown>(RECURSO)
    const lista: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { content?: unknown[] } | null)?.content)
        ? ((data as { content: unknown[] }).content)
        : []
    return lista.map((p) => normalizarProveedor(p))
  },

  obtener: async (id: number): Promise<Proveedor> => {
    const { data } = await axiosClient.get<unknown>(`${RECURSO}/${id}`)
    return normalizarProveedor(data)
  },

  crear: (data: ProveedorRequest) =>
    axiosClient.post<unknown>(RECURSO, aProveedorPayload(data)).then((r) => normalizarProveedor(r.data)),

  actualizar: (id: number, data: ProveedorRequest) =>
    axiosClient.put<unknown>(`${RECURSO}/${id}`, aProveedorPayload(data)).then((r) => normalizarProveedor(r.data)),
}