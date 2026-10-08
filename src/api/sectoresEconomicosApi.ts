import { axiosClient } from "./axiosClient"

export interface SectorEconomico {
  idSectorEconomico: number
  nombreSector: string
  descripcion?: string
}

export async function listarSectoresEconomicos(): Promise<SectorEconomico[]> {
  const { data } = await axiosClient.get<SectorEconomico[]>("/sectores-economicos")
  return data
}