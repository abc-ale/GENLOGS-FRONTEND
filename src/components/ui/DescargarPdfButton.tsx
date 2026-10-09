import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { descargarCotizacionPdf, descargarFacturaPdf, descargarOrdenCompraPdf } from '@/api/documentosApi'

type Tipo = 'cotizacion' | 'orden' | 'factura'

const acciones: Record<Tipo, (id: number) => Promise<void>> = {
  cotizacion: descargarCotizacionPdf,
  orden: descargarOrdenCompraPdf,
  factura: descargarFacturaPdf,
}

interface Props {
  tipo: Tipo
  id: number
  label?: string
  /** "compact" = solo ícono (para tablas); "solid" = botón con texto. */
  variant?: 'compact' | 'solid' | 'outline'
}

export function DescargarPdfButton({ tipo, id, label = 'Descargar PDF', variant = 'outline' }: Props) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(false)

  async function onClick() {
    setCargando(true)
    setError(false)
    try {
      await acciones[tipo](id)
    } catch {
      setError(true)
    } finally {
      setCargando(false)
    }
  }

  const base =
    variant === 'compact'
      ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground'
      : variant === 'solid'
        ? 'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
        : 'inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted'

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" onClick={onClick} disabled={cargando} title={label} aria-label={label} className={`${base} disabled:opacity-50`}>
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {variant !== 'compact' && label}
      </button>
      {error && <span className="mt-1 text-xs text-destructive">No se pudo generar el PDF.</span>}
    </span>
  )
}