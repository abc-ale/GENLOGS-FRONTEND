import { useEffect, useId, useRef, useState } from "react"
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react"
import { AlertCircle, CheckCircle2, FileText, Loader2, RotateCw, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { useUploadArchivo } from "@/hooks/useUploadArchivo"
import {
  acceptDe,
  formatearTamanio,
  formatosLegibles,
  tamanioMaximoDe,
} from "@/lib/validators/archivo.schema"
import type { TipoArchivo } from "@/lib/constants/uploads"
import type { ArchivoSubida, CloudinaryUploadResponse } from "@/types/upload.types"

export interface FileUploaderProps {
  /** "imagen" (JPG/PNG/WEBP, 5 MB) o "documento" (PDF/JPG/PNG, 10 MB). */
  tipo: TipoArchivo
  /** Se llama por cada archivo subido con éxito. */
  onUploaded: (resultado: CloudinaryUploadResponse, file: File) => void
  /** Se llama cuando el usuario quita un archivo que ya estaba subido. */
  onRemoved?: (resultado: CloudinaryUploadResponse) => void
  /** Avisa si hay subidas en curso (útil para bloquear el botón "Guardar"). */
  onUploadingChange?: (subiendo: boolean) => void
  label?: string
  helperText?: string
  /** Permite seleccionar y soltar varios archivos. */
  multiple?: boolean
  /** Tope de archivos vigentes cuando `multiple` es true. */
  maxArchivos?: number
  /** Sobrescribe los MIME permitidos del `tipo`. */
  mimesPermitidos?: readonly string[]
  /** Sobrescribe el tamaño máximo (bytes) del `tipo`. */
  tamanioMaximoBytes?: number
  disabled?: boolean
  className?: string
}

function textoEstado(archivo: ArchivoSubida): string {
  switch (archivo.estado) {
    case "pendiente":
      return "En cola"
    case "subiendo":
      return archivo.progreso >= 100 ? "Procesando…" : `Subiendo ${archivo.progreso}%`
    case "completado":
      return "Listo"
    case "error":
      return archivo.error ?? "Error al subir"
  }
}

function ItemArchivo({
  archivo,
  onReintentar,
  onQuitar,
}: {
  archivo: ArchivoSubida
  onReintentar: () => void
  onQuitar: () => void
}) {
  const enError = archivo.estado === "error"
  const enCurso = archivo.estado === "subiendo" || archivo.estado === "pendiente"

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-md border p-2",
        enError ? "border-destructive/40 bg-destructive/5" : "border-border bg-background"
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
        {archivo.previewUrl ? (
          <img
            src={archivo.previewUrl}
            alt={`Vista previa de ${archivo.file.name}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
            }}
          />
        ) : null}
        <FileText className="h-5 w-5 text-muted-foreground hidden" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium" title={archivo.file.name}>
            {archivo.file.name}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{formatearTamanio(archivo.file.size)}</span>
        </div>

        {enCurso && (
          <div
            role="progressbar"
            aria-label={`Progreso de ${archivo.file.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={archivo.progreso}
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] duration-200",
                archivo.estado === "subiendo" && archivo.progreso >= 100 && "animate-pulse"
              )}
              style={{ width: `${archivo.progreso}%` }}
            />
          </div>
        )}

        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            enError ? "text-destructive" : archivo.estado === "completado" ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          {enError && <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          {archivo.estado === "completado" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          {archivo.estado === "subiendo" && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
          <span>{textoEstado(archivo)}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {enError && archivo.reintentable && (
          <button
            type="button"
            onClick={onReintentar}
            aria-label={`Reintentar subida de ${archivo.file.name}`}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={onQuitar}
          aria-label={enCurso ? `Cancelar subida de ${archivo.file.name}` : `Quitar ${archivo.file.name}`}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

export function FileUploader({
  tipo,
  onUploaded,
  onRemoved,
  onUploadingChange,
  label = "Subir archivo",
  helperText,
  multiple = false,
  maxArchivos = 10,
  mimesPermitidos,
  tamanioMaximoBytes,
  disabled = false,
  className,
}: FileUploaderProps) {
  const inputId = useId()
  const ayudaId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [arrastrando, setArrastrando] = useState(false)

  const reglas = { tipo, mimesPermitidos, tamanioMaximoBytes }
  const { archivos, ocupado, aviso, agregarArchivos, reintentar, quitar } = useUploadArchivo({
    reglas,
    multiple,
    maxArchivos,
    onUploaded,
    onRemoved,
  })

  const onUploadingChangeRef = useRef(onUploadingChange)
  useEffect(() => {
    onUploadingChangeRef.current = onUploadingChange
  }, [onUploadingChange])
  useEffect(() => {
    onUploadingChangeRef.current?.(ocupado)
    return () => {
      onUploadingChangeRef.current?.(false)
    }
  }, [ocupado])

  const accept = acceptDe(reglas)
  const ayuda =
    helperText ??
    `${formatosLegibles(reglas)} · máximo ${formatearTamanio(tamanioMaximoDe(reglas))}${
      multiple ? ` por archivo · hasta ${maxArchivos} archivos` : ""
    }`

  function abrirSelector() {
    if (!disabled) inputRef.current?.click()
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const seleccionados = Array.from(e.target.files ?? [])
    // Permite volver a elegir el mismo archivo después de quitarlo.
    e.target.value = ""
    agregarArchivos(seleccionados)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      abrirSelector()
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled) setArrastrando(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setArrastrando(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastrando(false)
    if (disabled) return
    agregarArchivos(Array.from(e.dataTransfer.files))
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={`${inputId}-label`} className="text-sm font-medium">
        {label}
      </span>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-labelledby={`${inputId}-label`}
        aria-describedby={ayudaId}
        onClick={abrirSelector}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          arrastrando ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50",
          disabled && "cursor-not-allowed opacity-50 hover:border-border hover:bg-transparent"
        )}
      >
        <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm">
          <span className="font-medium text-primary">
            {multiple ? "Elige archivos" : "Elige un archivo"}
          </span>{" "}
          o arrástralo{multiple ? "s" : ""} aquí
        </p>
        <p id={ayudaId} className="text-xs text-muted-foreground">
          {ayuda}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInput}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          className="sr-only"
        />
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        {aviso && (
          <p role="status" className="text-xs text-amber-600">
            {aviso}
          </p>
        )}
        {archivos.length > 0 && (
          <ul className="flex flex-col gap-2">
            {archivos.map((archivo) => (
              <ItemArchivo
                key={archivo.id}
                archivo={archivo}
                onReintentar={() => reintentar(archivo.id)}
                onQuitar={() => quitar(archivo.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
