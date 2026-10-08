import {
  EXTENSIONES_LEGIBLES,
  MIME_TYPES_PERMITIDOS,
  TAMANIO_MAXIMO_BYTES,
} from "@/lib/constants/uploads"
import type { ReglasArchivo, ValidacionArchivoResult } from "@/types/upload.types"

export function formatearTamanio(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function mimesDe(reglas: ReglasArchivo): readonly string[] {
  return reglas.mimesPermitidos ?? MIME_TYPES_PERMITIDOS[reglas.tipo]
}

export function tamanioMaximoDe(reglas: ReglasArchivo): number {
  return reglas.tamanioMaximoBytes ?? TAMANIO_MAXIMO_BYTES[reglas.tipo]
}

export function formatosLegibles(reglas: ReglasArchivo): string {
  return mimesDe(reglas)
    .map((mime) => EXTENSIONES_LEGIBLES[mime] ?? mime)
    .join(", ")
}

const EXTENSION_A_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
}

export function obtenerMime(file: File): string {
  const mime = file.type?.toLowerCase().trim()
  if (mime) {
    if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg"
    return mime
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  return EXTENSION_A_MIME[extension] ?? ""
}

export function acceptDe(reglas: ReglasArchivo): string {
  const mimes = mimesDe(reglas)
  const extensiones: string[] = []
  if (mimes.includes("image/jpeg")) extensiones.push(".jpg", ".jpeg")
  if (mimes.includes("image/png")) extensiones.push(".png")
  if (mimes.includes("image/webp")) extensiones.push(".webp")
  if (mimes.includes("application/pdf")) extensiones.push(".pdf")
  return [...mimes, ...extensiones].join(",")
}

/**
 * Valida en el cliente, antes de enviar nada al backend:
 * archivo vacío, tipo MIME y tamaño máximo.
 */
export function validarArchivo(file: File, reglas: ReglasArchivo): ValidacionArchivoResult {
  if (file.size === 0) {
    return { valido: false, error: "El archivo está vacío." }
  }

  const mimeDetectado = obtenerMime(file)
  if (!mimesDe(reglas).includes(mimeDetectado)) {
    return {
      valido: false,
      error: `Formato no permitido. Usa ${formatosLegibles(reglas)}.`,
    }
  }

  const maximo = tamanioMaximoDe(reglas)
  if (file.size > maximo) {
    return {
      valido: false,
      error: `Pesa ${formatearTamanio(file.size)} y el máximo es ${formatearTamanio(maximo)}.`,
    }
  }

  return { valido: true }
}
