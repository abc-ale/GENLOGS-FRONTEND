import axios from "axios"
import { axiosClient } from "./axiosClient"
import type { CloudinaryUploadResponse, OpcionesSubida } from "../types/upload.types"

/**
 * Endpoint del backend que recibe el multipart y lo reenvía a Cloudinary
 * (CloudinaryService). Se cambia solo aquí si el backend lo renombra.
 */
export const UPLOAD_ENDPOINT = "/archivos/upload"

export type { CloudinaryUploadResponse }

export async function subirArchivo(
  file: File,
  { onProgress, signal }: OpcionesSubida = {}
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await axiosClient.post<CloudinaryUploadResponse>(UPLOAD_ENDPOINT, formData, {
    // Los archivos grandes en redes lentas superan el timeout global de 60 s.
    timeout: 5 * 60_000,
    signal,
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.min(100, Math.round((evt.loaded * 100) / evt.total)))
      }
    },
  })

  return data
}

/** true si el error viene de cancelar la petición con AbortController. */
export function esSubidaCancelada(error: unknown): boolean {
  return axios.isCancel(error)
}

/** Extrae un mensaje legible de un error de subida. */
export function mensajeErrorSubida(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "La subida tardó demasiado. Intenta de nuevo."
    if (error.response?.status === 413) return "El servidor rechazó el archivo por su tamaño."
    if (error.response?.status === 415) return "El servidor no acepta este tipo de archivo."
    const mensaje = (error.response?.data as { message?: string } | undefined)?.message
    if (mensaje) return mensaje
    if (!error.response) return "Sin conexión con el servidor. Revisa tu red."
  }
  return "No se pudo subir el archivo. Intenta de nuevo."
}
