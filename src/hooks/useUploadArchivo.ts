import { useEffect, useRef, useState } from "react"
import { esSubidaCancelada, mensajeErrorSubida, subirArchivo } from "@/api/cloudinaryApi"
import { SUBIDAS_SIMULTANEAS } from "@/lib/constants/uploads"
import { validarArchivo } from "@/lib/validators/archivo.schema"
import type {
  ArchivoSubida,
  CloudinaryUploadResponse,
  ReglasArchivo,
} from "@/types/upload.types"

export interface OpcionesUseUploadArchivo {
  reglas: ReglasArchivo
  /** false: un solo archivo, una selección nueva reemplaza la anterior. */
  multiple?: boolean
  /** Tope de archivos vigentes cuando `multiple` es true. */
  maxArchivos?: number
  /** Se ejecuta por cada archivo subido con éxito. */
  onUploaded?: (resultado: CloudinaryUploadResponse, file: File) => void
  /** Se ejecuta cuando el usuario quita un archivo que ya se había subido. */
  onRemoved?: (resultado: CloudinaryUploadResponse) => void
}

export interface UseUploadArchivoResult {
  archivos: ArchivoSubida[]
  /** true mientras haya archivos pendientes o subiéndose. */
  ocupado: boolean
  /** Mensaje general (límite de archivos, duplicados, etc.). */
  aviso: string | null
  agregarArchivos: (files: File[]) => void
  reintentar: (id: string) => void
  quitar: (id: string) => void
  reiniciar: () => void
  limpiarAviso: () => void
}

const claveArchivo = (f: File) => `${f.name}|${f.size}|${f.lastModified}`

export function useUploadArchivo({
  reglas,
  multiple = false,
  maxArchivos = 10,
  onUploaded,
  onRemoved,
}: OpcionesUseUploadArchivo): UseUploadArchivoResult {
  const [archivos, setArchivos] = useState<ArchivoSubida[]>([])
  const [aviso, setAviso] = useState<string | null>(null)

  // Espejo del estado para leerlo dentro de handlers sin cierres obsoletos.
  const archivosRef = useRef<ArchivoSubida[]>([])
  const callbacksRef = useRef({ onUploaded, onRemoved })
  const controllersRef = useRef(new Map<string, AbortController>())
  const colaRef = useRef<Array<{ id: string; file: File }>>([])
  const activosRef = useRef(0)
  const previewsRef = useRef(new Set<string>())
  const contadorRef = useRef(0)

  useEffect(() => {
    archivosRef.current = archivos
  }, [archivos])

  useEffect(() => {
    callbacksRef.current = { onUploaded, onRemoved }
  }, [onUploaded, onRemoved])

  // Al desmontar: cancela subidas en curso y libera las URLs de preview.
  useEffect(() => {
    const controllers = controllersRef.current
    const previews = previewsRef.current
    const cola = colaRef
    return () => {
      controllers.forEach((c) => c.abort())
      controllers.clear()
      previews.forEach((url) => URL.revokeObjectURL(url))
      previews.clear()
      cola.current = []
    }
  }, [])

  function actualizar(id: string, cambios: Partial<ArchivoSubida>) {
    setArchivos((prev) => prev.map((a) => (a.id === id ? { ...a, ...cambios } : a)))
  }

  async function correr(id: string, file: File) {
    const controller = new AbortController()
    controllersRef.current.set(id, controller)
    actualizar(id, { estado: "subiendo", progreso: 0, error: undefined })

    try {
      const resultado = await subirArchivo(file, {
        signal: controller.signal,
        onProgress: (progreso) => actualizar(id, { progreso }),
      })
      actualizar(id, { estado: "completado", progreso: 100, resultado })
      callbacksRef.current.onUploaded?.(resultado, file)
    } catch (error) {
      if (esSubidaCancelada(error)) return
      actualizar(id, { estado: "error", error: mensajeErrorSubida(error), reintentable: true })
    } finally {
      controllersRef.current.delete(id)
    }
  }

  function drenarCola() {
    while (activosRef.current < SUBIDAS_SIMULTANEAS && colaRef.current.length > 0) {
      const siguiente = colaRef.current.shift()
      if (!siguiente) break
      activosRef.current += 1
      void correr(siguiente.id, siguiente.file).finally(() => {
        activosRef.current -= 1
        drenarCola()
      })
    }
  }

  function liberarPreview(url: string | null) {
    if (!url) return
    URL.revokeObjectURL(url)
    previewsRef.current.delete(url)
  }

  function descartar(item: ArchivoSubida) {
    controllersRef.current.get(item.id)?.abort()
    colaRef.current = colaRef.current.filter((c) => c.id !== item.id)
    liberarPreview(item.previewUrl)
    if (item.resultado) callbacksRef.current.onRemoved?.(item.resultado)
  }

  function agregarArchivos(files: File[]) {
    if (files.length === 0) return
    setAviso(null)

    let existentes = archivosRef.current
    const avisos: string[] = []
    let candidatos = files

    if (!multiple) {
      if (files.length > 1) avisos.push("Solo se acepta un archivo; se usó el primero.")
      candidatos = [files[0]]
      existentes.forEach(descartar)
      existentes = []
    } else {
      const yaSubidos = new Set(existentes.map((a) => claveArchivo(a.file)))
      const sinDuplicados = candidatos.filter((f) => !yaSubidos.has(claveArchivo(f)))
      const repetidos = candidatos.length - sinDuplicados.length
      if (repetidos > 0) {
        avisos.push(
          repetidos === 1
            ? "Un archivo ya estaba en la lista y se omitió."
            : `${repetidos} archivos ya estaban en la lista y se omitieron.`
        )
      }
      candidatos = sinDuplicados

      const vigentes = existentes.filter((a) => a.reintentable).length
      const cupo = Math.max(0, maxArchivos - vigentes)
      if (candidatos.length > cupo) {
        avisos.push(`Máximo ${maxArchivos} archivos. Se ignoraron ${candidatos.length - cupo}.`)
        candidatos = candidatos.slice(0, cupo)
      }
    }

    const nuevos: ArchivoSubida[] = candidatos.map((file) => {
      contadorRef.current += 1
      const id = `${Date.now().toString(36)}-${contadorRef.current}`
      const validacion = validarArchivo(file, reglas)

      if (!validacion.valido) {
        return {
          id,
          file,
          estado: "error",
          progreso: 0,
          previewUrl: null,
          error: validacion.error,
          reintentable: false,
        }
      }

      let previewUrl: string | null = null
      const isImage = file.type.startsWith("image/") && !file.type.includes("svg")
      if (isImage) {
        try {
          previewUrl = URL.createObjectURL(file)
          previewsRef.current.add(previewUrl)
        } catch {
          previewUrl = null
        }
      }
      colaRef.current.push({ id, file })
      return { id, file, estado: "pendiente", progreso: 0, previewUrl, reintentable: true }
    })

    setArchivos(multiple ? [...existentes, ...nuevos] : nuevos)
    if (avisos.length > 0) setAviso(avisos.join(" "))
    drenarCola()
  }

  function reintentar(id: string) {
    const item = archivosRef.current.find((a) => a.id === id)
    if (!item || !item.reintentable || item.estado !== "error") return
    actualizar(id, { estado: "pendiente", progreso: 0, error: undefined })
    colaRef.current.push({ id, file: item.file })
    drenarCola()
  }

  function quitar(id: string) {
    const item = archivosRef.current.find((a) => a.id === id)
    if (!item) return
    descartar(item)
    setArchivos((prev) => prev.filter((a) => a.id !== id))
  }

  function reiniciar() {
    archivosRef.current.forEach(descartar)
    setArchivos([])
    setAviso(null)
  }

  const ocupado = archivos.some((a) => a.estado === "pendiente" || a.estado === "subiendo")

  return {
    archivos,
    ocupado,
    aviso,
    agregarArchivos,
    reintentar,
    quitar,
    reiniciar,
    limpiarAviso: () => setAviso(null),
  }
}
