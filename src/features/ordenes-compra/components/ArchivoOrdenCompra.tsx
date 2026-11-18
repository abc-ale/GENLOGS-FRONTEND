import { useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { ExternalLink, Loader2, Paperclip, Upload } from 'lucide-react'
import { useAdjuntarArchivoOrdenCompra } from '../hooks/useOrdenesCompra'

/** Formatos aceptados para el archivo del cliente: PDF, imágenes, Word y Excel. */
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx'
/** Límite por archivo del documento (RNF-06): 20 MB. */
const TAMANIO_MAXIMO = 20 * 1024 * 1024

interface ArchivoOrdenCompraProps {
  idOrdenCompra: number
  numero: string
  urlArchivo?: string | null
}

function validar(archivo: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return 'Formato no permitido. Usa PDF, JPG, PNG, Word o Excel.'
  }
  if (archivo.size > TAMANIO_MAXIMO) {
    return 'El archivo supera los 20 MB.'
  }
  return null
}

function mensajeError(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 413) return 'El archivo supera el tamaño permitido.'
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
  }
  return 'No se pudo adjuntar el archivo. Inténtalo de nuevo.'
}

/**
 * Celda de la tabla de órdenes: adjunta el archivo enviado por el cliente
 * (RF-35, CU-19) o, si ya existe, permite verlo y reemplazarlo.
 */
export function ArchivoOrdenCompra({ idOrdenCompra, numero, urlArchivo }: ArchivoOrdenCompraProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const adjuntar = useAdjuntarArchivoOrdenCompra()

  function onSeleccionar(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0]
    // Permite volver a elegir el mismo archivo si falla.
    event.target.value = ''
    if (!archivo) return

    const invalido = validar(archivo)
    if (invalido) {
      setError(invalido)
      return
    }

    setError(null)
    adjuntar.mutate(
      { id: idOrdenCompra, archivo },
      { onError: (e) => setError(mensajeError(e)) },
    )
  }

  return (
    <div className="flex min-w-40 flex-col gap-1">
      <div className="flex items-center gap-3">
        {urlArchivo && (
          <a
            href={urlArchivo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Ver
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only"> archivo de la orden {numero}</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={adjuntar.isPending}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-wait disabled:opacity-60"
        >
          {adjuntar.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {adjuntar.isPending ? 'Subiendo…' : urlArchivo ? 'Reemplazar' : 'Adjuntar'}
          <span className="sr-only"> archivo de la orden {numero}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onSeleccionar}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
