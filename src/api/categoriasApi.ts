import { axiosClient } from "./axiosClient"

export interface CategoriaProducto {
  idCategoriaProducto: number
  idCategoriaPadre?: number
  nombreCategoria: string
  slugWeb: string
  nivel: number
}

export async function listarCategoriasProducto(): Promise<CategoriaProducto[]> {
  const { data } = await axiosClient.get<CategoriaProducto[]>("/categorias-producto")
  return data
}