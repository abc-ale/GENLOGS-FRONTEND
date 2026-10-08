import { axiosClient } from "./axiosClient"

export interface CategoriaServicio {
  idCategoriaServicio: number
  idCategoriaPadre?: number
  nombreCategoria: string
  slugWeb: string
}

export async function listarCategoriasServicio(): Promise<CategoriaServicio[]> {
  const { data } = await axiosClient.get<CategoriaServicio[]>("/categorias-servicio")
  return data
}