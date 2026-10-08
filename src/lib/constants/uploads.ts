export const MIME_TYPES_PERMITIDOS = {
  imagen: ["image/jpeg", "image/png", "image/webp"],
  documento: ["application/pdf", "image/jpeg", "image/png"],
} as const

export const TAMANIO_MAXIMO_BYTES = {
  imagen: 5 * 1024 * 1024,
  documento: 10 * 1024 * 1024,
} as const

/** Etiquetas legibles para mostrar en el dropzone. */
export const EXTENSIONES_LEGIBLES: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "application/pdf": "PDF",
}

/** Cantidad de subidas simultáneas hacia el backend. */
export const SUBIDAS_SIMULTANEAS = 3

export type TipoArchivo = keyof typeof MIME_TYPES_PERMITIDOS
