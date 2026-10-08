import { axiosClient } from './axiosClient'
import type { ContactoCliente, ContactoClienteRequest } from '../types/proveedor.types'

export const contactosClienteApi = {
  agregar: (clienteId: number, data: ContactoClienteRequest) =>
    axiosClient
      .post<ContactoCliente>(`/clientes/${clienteId}/contactos`, data)
      .then((r) => r.data),
  eliminar: (clienteId: number, contactoId: number) =>
    axiosClient.delete<void>(`/clientes/${clienteId}/contactos/${contactoId}`),
}
