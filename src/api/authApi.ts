import { axiosClient } from './axiosClient';
import type { LoginRequest, LoginResponse } from "@/types/auth"

export interface TokenResetInfo {
  segundosRestantes: number
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axiosClient.post<LoginResponse>("/auth/login", data)
  return response.data
}

export async function solicitarRecuperacion(correo: string): Promise<void> {
  await axiosClient.post("/auth/forgot-password", { correo })
}

/** Pregunta al backend si el enlace del correo sigue vigente (no vencido ni usado). */
export async function validarTokenReset(token: string): Promise<TokenResetInfo> {
  const { data } = await axiosClient.post<TokenResetInfo>("/auth/validate-reset-token", { token })
  return data
}

export async function restablecerPassword(
  token: string,
  nuevaPassword: string
): Promise<void> {
  await axiosClient.post("/auth/reset-password", { token, nuevaPassword })
}