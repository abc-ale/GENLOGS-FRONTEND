import {axiosClient} from "./axiosClient"

export interface Marca {
  idMarca: number
  nombreMarca: string
}

export async function listarMarcas(): Promise<Marca[]> {
  const { data } = await axiosClient.get<Marca[]>("/marcas")
  return data
}