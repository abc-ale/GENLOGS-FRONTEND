import { axiosClient } from "./axiosClient";
import type { Rol } from "@/types/usuario"

export async function listarRoles(): Promise<Rol[]> {
  const response = await axiosClient.get<Rol[]>("/roles")
  return response.data
}
