import type { TipoArchivo } from "@/lib/constants/uploads"

/** Respuesta del backend (CloudinaryService) tras subir un archivo. */
export interface CloudinaryUploadResponse {
  url: string
  nombreArchivo: string
  tipoArchivo: string
  tamanioBytes: number
}

export type EstadoSubida = "pendiente" | "subiendo" | "completado" | "error"

/** Un archivo dentro de la cola del FileUploader. */
export interface ArchivoSubida {
  /** Identificador local (no viaja al backend). */
  id: string
  file: File
  estado: EstadoSubida
  /** 0-100 */
  progreso: number
  /** Object URL para previsualizar imágenes; null si no es imagen. */
  previewUrl: string | null
  resultado?: CloudinaryUploadResponse
  error?: string
  /** false cuando el archivo fue rechazado por validación (no tiene sentido reintentar). */
  reintentable: boolean
}

export interface ReglasArchivo {
  tipo: TipoArchivo
  /** Sobrescribe los MIME permitidos del tipo. */
  mimesPermitidos?: readonly string[]
  /** Sobrescribe el tamaño máximo (bytes) del tipo. */
  tamanioMaximoBytes?: number
}

export interface ValidacionArchivoResult {
  valido: boolean
  error?: string
}

export interface OpcionesSubida {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}
