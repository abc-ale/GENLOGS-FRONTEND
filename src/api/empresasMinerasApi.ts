import { axiosClient } from './axiosClient'
import type { PageResponse } from '@/types/common.types'
import type { EmpresaMinera, EmpresaMineraFiltros, EmpresaMineraInput, Mineral } from '@/types/empresaMinera.types'

export const empresasMinerasApi = {
  listar: async (filtros: EmpresaMineraFiltros = {}): Promise<EmpresaMinera[]> => {
    const { data } = await axiosClient.get<PageResponse<EmpresaMinera> | EmpresaMinera[]>('/empresas-mineras', { params: filtros })
    return Array.isArray(data) ? data : data.content ?? []
  },
  obtener: (id: number) => axiosClient.get<EmpresaMinera>(`/empresas-mineras/${id}`).then((r) => r.data),
  crear: (data: EmpresaMineraInput) => axiosClient.post<EmpresaMinera>('/empresas-mineras', data).then((r) => r.data),
  actualizar: (id: number, data: EmpresaMineraInput) => axiosClient.put<EmpresaMinera>(`/empresas-mineras/${id}`, data).then((r) => r.data),
  listarMinerales: () => axiosClient.get<Mineral[]>('/minerales').then((r) => r.data),
}
