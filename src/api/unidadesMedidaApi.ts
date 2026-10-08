import { axiosClient } from "./axiosClient"

export interface UnidadMedida {
  idUnidadMedida: number
  codigoUnidad: string
  nombreUnidad: string
}

export async function listarUnidadesMedida(): Promise<UnidadMedida[]> {
  const { data } = await axiosClient.get<UnidadMedida[]>("/unidades-medida")
  return data
}