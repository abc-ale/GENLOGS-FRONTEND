import { axiosClient } from "./axiosClient";
import type { UsuarioRequest, UsuarioResponse } from "@/types/usuario"

export async function listarUsuarios(): Promise<UsuarioResponse[]> {
  const response = await axiosClient.get<UsuarioResponse[]>("/usuarios")
  return response.data
}

export async function crearUsuario(data: UsuarioRequest): Promise<UsuarioResponse> {
  const response = await axiosClient.post<UsuarioResponse>("/usuarios", data)
  return response.data
}

export async function cambiarBloqueoUsuario(
  idUsuario: number,
  bloqueado: boolean
): Promise<UsuarioResponse> {
  const response = await axiosClient.patch<UsuarioResponse>(
    `/usuarios/${idUsuario}/bloqueo?bloqueado=${bloqueado}`
  )
  return response.data
}


export interface ConsultaDocumento {
  numeroDocumento: string
  tipoDocumento: "DNI" | "RUC"
  razonSocial: string | null
  nombres: string | null
  apellidoPaterno: string | null
  apellidoMaterno: string | null
  direccion: string | null
  simulado: boolean
}

/** Autocompleta con Factiliza. Solo acepta DNI (8) o RUC (11). */
export async function consultarDocumento(numero: string): Promise<ConsultaDocumento> {
  const response = await axiosClient.get<ConsultaDocumento>(`/terceros/consultar-documento/${numero}`)
  return response.data
}