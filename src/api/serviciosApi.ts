import { axiosClient } from "./axiosClient"
import type { Servicio, ServicioFormValues } from "@/types/servicio.types"

interface ListarServiciosParams {
  soloActivos?: boolean
  idCategoriaServicio?: number
}

export async function listarServicios(params: ListarServiciosParams = {}): Promise<Servicio[]> {
  const { data } = await axiosClient.get<Servicio[]>("/servicios", {
    params: {
      soloActivos: params.soloActivos ?? true,
      idCategoriaServicio: params.idCategoriaServicio,
    },
  })
  return data
}

export async function buscarServicioPorId(id: number): Promise<Servicio> {
  const { data } = await axiosClient.get<Servicio>(`/servicios/${id}`)
  return data
}

export async function registrarServicio(valores: ServicioFormValues): Promise<Servicio> {
  const { data } = await axiosClient.post<Servicio>("/servicios", valores)
  return data
}

export async function actualizarServicio(id: number, valores: ServicioFormValues): Promise<Servicio> {
  const { data } = await axiosClient.put<Servicio>(`/servicios/${id}`, valores)
  return data
}

export async function desactivarServicio(id: number): Promise<void> {
  await axiosClient.delete(`/servicios/${id}`)
}