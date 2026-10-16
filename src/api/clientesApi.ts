import axios from 'axios'
import { axiosClient } from './axiosClient'
import type { Cliente, ClienteRequest, FiltrosCliente } from '../types/cliente.types'
import type { EmpresaMinera } from '../types/empresaMinera.types'
import {
  aClientePayload,
  normalizarCliente,
  normalizarContacto,
  normalizarEmpresaMinera,
} from './terceroMappers'

const RECURSO = '/clientes'

function esNoEncontrado(e: unknown): boolean {
  return axios.isAxiosError(e) && e.response?.status === 404
}

export const clientesApi = {
  /**
   * Los filtros (texto de búsqueda, sector, situación) y la paginación viajan
   * al backend como `params`, para no traer la cartera completa a memoria en
   * cada búsqueda (la búsqueda global manda size=5). El recorte final en
   * cliente queda como red de seguridad por si el backend ignora algún
   * parámetro puntual: se aplica sobre lo que ya devolvió el servidor.
   */
  listar: async (filtros: FiltrosCliente = {}): Promise<Cliente[]> => {
    const { data } = await axiosClient.get<unknown>(RECURSO, { params: filtros })
    const lista: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { content?: unknown[] } | null)?.content)
        ? ((data as { content: unknown[] }).content)
        : []
    const clientes = lista.map((c) => normalizarCliente(c))

    const texto = (filtros.documento ?? filtros.razonSocial ?? '').trim().toLowerCase()
    return clientes.filter((c) => {
      if (texto && !c.tercero.numeroDocumento.toLowerCase().includes(texto)
        && !c.tercero.razonSocial.toLowerCase().includes(texto)) return false
      if (filtros.idSectorEconomico && c.idSectorEconomico !== filtros.idSectorEconomico) return false
      if (filtros.situacion && c.situacion !== filtros.situacion) return false
      return true
    })
  },

  /** Cabecera + contactos del tercero + unidad minera del cliente (si tiene). */
  obtener: async (id: number): Promise<Cliente> => {
    const { data } = await axiosClient.get<unknown>(`${RECURSO}/${id}`)
    const base = normalizarCliente(data)

    const [contactosRaw, empresaRaw] = await Promise.all([
      axiosClient.get<unknown[]>(`/terceros/${base.idTercero}/contactos`).then((r) => r.data),
      axiosClient
        .get<unknown>(`/empresas-mineras/por-cliente/${id}`)
        .then((r) => [r.data])
        .catch((e): unknown[] => {
          if (esNoEncontrado(e)) return [] // un cliente sin unidad minera es normal
          return []
        }),
    ])

    const empresas: EmpresaMinera[] = empresaRaw.map(normalizarEmpresaMinera)
    return normalizarCliente(data, contactosRaw.map(normalizarContacto), empresas)
  },

  crear: (data: ClienteRequest) =>
    axiosClient.post<unknown>(RECURSO, aClientePayload(data)).then((r) => normalizarCliente(r.data)),

  actualizar: (id: number, data: ClienteRequest) =>
    axiosClient.put<unknown>(`${RECURSO}/${id}`, aClientePayload(data)).then((r) => normalizarCliente(r.data)),
}