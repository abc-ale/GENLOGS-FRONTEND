import { axiosClient } from './axiosClient'
import type { ContactoCliente, ContactoClienteRequest } from '../types/proveedor.types'
import { aContactoPayload, normalizarContacto } from './terceroMappers'

/**
 * Los contactos pertenecen al TERCERO, no al cliente:
 *   GET/POST /api/terceros/{idTercero}/contactos
 *   PUT/DELETE /api/contactos/{idContacto}
 */
export const contactosClienteApi = {
  listar: (idTercero: number): Promise<ContactoCliente[]> =>
    axiosClient.get<unknown[]>(`/terceros/${idTercero}/contactos`).then((r) => r.data.map(normalizarContacto)),

  agregar: (idTercero: number, data: ContactoClienteRequest): Promise<ContactoCliente> =>
    axiosClient.post<unknown>(`/terceros/${idTercero}/contactos`, aContactoPayload(data)).then((r) => normalizarContacto(r.data)),

  eliminar: (contactoId: number) => 
    axiosClient.delete<void>(`/contactos/${contactoId}`),
}