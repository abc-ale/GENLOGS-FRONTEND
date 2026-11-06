import { useState } from "react"
import { isAxiosError } from "axios"
import { Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { cn } from "@/lib/utils/utils"

export interface OpcionEstado {
  value: string
  label: string
}

interface EstadoEditableProps {
  /** Código actual del estado (p. ej. "EMITIDA"). */
  valor?: string
  opciones: OpcionEstado[]
  /** Texto para el diálogo: "la orden OC-001", "el comprobante F001-45". */
  descripcionItem: string
  /** Debe lanzar si el backend rechaza el cambio. */
  onCambiar: (nuevoValor: string) => Promise<unknown>
}

const COLORES: Record<string, string> = {
  RECIBIDA: "bg-blue-50 text-blue-700 border-blue-200",
  EMITIDA: "bg-blue-50 text-blue-700 border-blue-200",
  EN_ATENCION: "bg-amber-50 text-amber-700 border-amber-200",
  PARCIAL: "bg-amber-50 text-amber-700 border-amber-200",
  ATENDIDA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAGADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VENCIDA: "bg-orange-50 text-orange-700 border-orange-200",
  ANULADA: "bg-red-50 text-red-700 border-red-200",
}

function mensajeError(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
  }
  return "No se pudo cambiar el estado. Inténtalo de nuevo."
}

/** Selector de estado dentro de una tabla: pide confirmación y muestra el motivo si el backend lo rechaza. */
export function EstadoEditable({ valor, opciones, descripcionItem, onCambiar }: EstadoEditableProps) {
  const [pendiente, setPendiente] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const etiqueta = (v: string) => opciones.find((o) => o.value === v)?.label ?? v

  async function confirmar() {
    if (!pendiente) return
    setGuardando(true)
    setError(null)
    try {
      await onCambiar(pendiente)
      setPendiente(null)
    } catch (e) {
      setError(mensajeError(e))
      setPendiente(null)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-w-[9.5rem]">
      <div className="relative inline-block">
        <select
          aria-label={`Estado de ${descripcionItem}`}
          value={valor ?? ""}
          disabled={guardando}
          onChange={(e) => { setError(null); if (e.target.value !== valor) setPendiente(e.target.value) }}
          className={cn(
            "h-8 cursor-pointer rounded-full border px-3 pr-7 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60",
            COLORES[valor ?? ""] ?? "border-border bg-muted text-foreground",
          )}
        >
          {!valor && <option value="">Sin estado</option>}
          {opciones.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {guardando && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
      </div>
      {error && <p role="alert" className="mt-1 max-w-[16rem] text-xs text-destructive">{error}</p>}

      <ConfirmDialog
        open={pendiente !== null}
        title="Cambiar estado"
        description={`¿Cambiar ${descripcionItem} de «${etiqueta(valor ?? "")}» a «${etiqueta(pendiente ?? "")}»?`}
        confirmLabel="Cambiar estado"
        variant="default"
        isLoading={guardando}
        onConfirm={() => void confirmar()}
        onCancel={() => setPendiente(null)}
      />
    </div>
  )
}