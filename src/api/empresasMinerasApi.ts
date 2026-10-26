import { axiosClient } from './axiosClient'
import type { PageResponse } from '@/types/common.types'
import type { EmpresaMinera, EmpresaMineraFiltros, EmpresaMineraInput, Mineral } from '@/types/empresaMinera.types'

export const empresasMinerasApi = {
  listar: async (filtros: EmpresaMineraFiltros = {}): Promise<EmpresaMinera[]> => {
    const { data } = await axiosClient.get<PageResponse<EmpresaMinera> | EmpresaMinera[]>('/empresas-mineras', { params: filtros })
    return Array.isArray(data) ? data : data.content ?? []
  },
  obtener: (id: number) => axiosClient.get<EmpresaMinera>(`/empresas-mineras/${id}`).then((r) => r.data),
  /**
   * id_cliente es UNIQUE en la tabla empresa_minera (1 a 1 con Cliente), así
   * que el backend devuelve como mucho una unidad por cliente, no una lista.
   * Devuelve null si el cliente no tiene unidad minera asociada (404).
   */
  obtenerPorCliente: (idCliente: number) =>
    axiosClient
      .get<EmpresaMinera>(`/empresas-mineras/por-cliente/${idCliente}`)
      .then((r) => r.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null
        throw err
      }),
  crear: (data: EmpresaMineraInput) => axiosClient.post<EmpresaMinera>('/empresas-mineras', { cliente: { idCliente: data.idCliente }, etapaComercial: { idEtapaComercial: data.idEtapaComercial }, tipoOperacion: { idTipoOperacion: data.idTipoOperacion }, nombreUnidadMinera: data.nombreUnidadMinera, latitud: data.latitud, longitud: data.longitud, altitudMsnm: data.altitudMsnm, capacidadProduccion: data.capacidadProduccion, descripcion: data.descripcion }).then((r) => r.data),
  actualizar: (id: number, data: EmpresaMineraInput) => axiosClient.put<EmpresaMinera>(`/empresas-mineras/${id}`, data).then((r) => r.data),
  // Alias corto que expone CatalogoComboController (/api/catalogos/minerales
  // es el real; /api/minerales no existe y devolvía 404).
  listarMinerales: () => axiosClient.get<Mineral[]>('/catalogos/minerales').then((r) => r.data),
}

