import { axiosClient } from './axiosClient'
import type { RegistroCatalogo } from '@/features/catalogos-maestros/catalogosMaestros.config'

/** CRUD genérico de los catálogos maestros en /catalogos/{recurso} (RF-20, CU-14). */
export const catalogosMaestrosApi = {
  listar: (recurso: string, soloActivos: boolean) =>
    axiosClient
      .get<RegistroCatalogo[]>(`/catalogos/${recurso}`, { params: { soloActivos } })
      .then((r) => r.data),
  crear: (recurso: string, datos: RegistroCatalogo) =>
    axiosClient.post<RegistroCatalogo>(`/catalogos/${recurso}`, datos).then((r) => r.data),
  actualizar: (recurso: string, id: number, datos: RegistroCatalogo) =>
    axiosClient.put<RegistroCatalogo>(`/catalogos/${recurso}/${id}`, datos).then((r) => r.data),
  /** Baja lógica: el backend cambia el estado a inactivo, no borra el registro. */
  desactivar: (recurso: string, id: number) =>
    axiosClient.delete(`/catalogos/${recurso}/${id}`).then(() => undefined),
}
