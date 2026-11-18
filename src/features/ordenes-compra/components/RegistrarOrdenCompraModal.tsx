import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useCotizaciones } from '@/features/cotizaciones/hooks/useCotizaciones'
import { useCrearOrdenCompra, useOrdenesCompra } from '../hooks/useOrdenesCompra'
import { EstadoCotizacion } from '@/types/cotizacion.types'
import { EstadoOrdenCompra } from '@/types/ordenCompra.types'

/** Formato de numeración de la orden de compra definido en el documento: NNNN-NN. */
const FORMATO_NUMERO_OC = /^\d{4}-\d{2}$/

interface RegistrarOrdenCompraModalProps {
  onClose: () => void
  onRegistrada?: (numero: string) => void
}

function hoyIso(): string {
  const ahora = new Date()
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function mensajeError(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
  }
  return 'No se pudo registrar la orden de compra. Inténtalo de nuevo.'
}

/**
 * Registro manual de la orden de compra (RF-33, CU-20): solo sobre una
 * cotización APROBADA y con una sola orden no anulada por cotización.
 * La orden nace en estado RECIBIDA (lo asigna el backend).
 */
export function RegistrarOrdenCompraModal({ onClose, onRegistrada }: RegistrarOrdenCompraModalProps) {
  const [idCotizacion, setIdCotizacion] = useState('')
  const [numeroOrdenCompra, setNumeroOrdenCompra] = useState('')
  const [fechaEmisionCliente, setFechaEmisionCliente] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  const cotizaciones = useCotizaciones({ estadoCotizacion: EstadoCotizacion.APROBADA, size: 100 })
  const ordenes = useOrdenesCompra({ size: 100 })
  const crear = useCrearOrdenCompra()

  // Una cotización con una orden no anulada ya no puede originar otra.
  const disponibles = useMemo(() => {
    const conOrdenActiva = new Set(
      (ordenes.data?.content ?? [])
        .filter((orden) => orden.estadoCodigo !== EstadoOrdenCompra.ANULADA)
        .map((orden) => orden.idCotizacion),
    )
    return (cotizaciones.data?.content ?? []).filter(
      (cotizacion) => !conOrdenActiva.has(Number(cotizacion.idCotizacion)),
    )
  }, [cotizaciones.data, ordenes.data])

  const seleccionada = disponibles.find((c) => String(c.idCotizacion) === idCotizacion)
  const numeroValido = FORMATO_NUMERO_OC.test(numeroOrdenCompra.trim())
  const cargando = cotizaciones.isLoading || ordenes.isLoading

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !crear.isPending) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, crear.isPending])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!seleccionada) {
      setError('Selecciona la cotización aprobada que origina la orden.')
      return
    }
    if (!numeroValido) {
      setError('El número de orden debe tener el formato NNNN-NN (por ejemplo, 0001-26).')
      return
    }

    const numero = numeroOrdenCompra.trim()
    try {
      await crear.mutateAsync({
        idCotizacion: Number(seleccionada.idCotizacion),
        numeroOrdenCompra: numero,
        fechaEmisionCliente: fechaEmisionCliente || undefined,
        observaciones: observaciones.trim() || undefined,
      })
      onRegistrada?.(numero)
      onClose()
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-registrar-oc"
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4 rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <header className="space-y-1">
          <h2 id="titulo-registrar-oc" className="text-lg font-semibold text-foreground">
            Registrar orden de compra
          </h2>
          <p className="text-sm text-muted-foreground">
            Solo se listan cotizaciones aprobadas sin una orden activa. La orden se registra en estado Recibida.
          </p>
        </header>

        <div className="space-y-1">
          <label htmlFor="oc-cotizacion" className="text-sm font-medium">
            Cotización aprobada
          </label>
          <select
            id="oc-cotizacion"
            required
            disabled={cargando}
            value={idCotizacion}
            onChange={(e) => setIdCotizacion(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60"
          >
            <option value="">{cargando ? 'Cargando cotizaciones…' : 'Selecciona una cotización'}</option>
            {disponibles.map((c) => (
              <option key={c.idCotizacion} value={String(c.idCotizacion)}>
                {c.codigoCotizacion} — {c.clienteNombre || 'Sin cliente'}
              </option>
            ))}
          </select>
          {!cargando && disponibles.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay cotizaciones aprobadas pendientes de orden de compra.
            </p>
          )}
          {(cotizaciones.isError || ordenes.isError) && (
            <p className="text-xs text-destructive">No se pudieron cargar las cotizaciones aprobadas.</p>
          )}
        </div>

        {seleccionada && (
          <dl className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-3 text-sm">
            <dt className="text-muted-foreground">Cliente</dt>
            <dd className="text-right font-medium">{seleccionada.clienteNombre || '—'}</dd>
            <dt className="text-muted-foreground">Total cotizado</dt>
            <dd className="text-right font-medium">
              {seleccionada.moneda} {seleccionada.total.toFixed(2)}
            </dd>
          </dl>
        )}

        <div className="space-y-1">
          <label htmlFor="oc-numero" className="text-sm font-medium">
            Número de orden de compra
          </label>
          <input
            id="oc-numero"
            required
            placeholder="0001-26"
            maxLength={7}
            aria-invalid={numeroOrdenCompra.length > 0 && !numeroValido}
            aria-describedby="oc-numero-ayuda"
            value={numeroOrdenCompra}
            onChange={(e) => setNumeroOrdenCompra(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
          <p
            id="oc-numero-ayuda"
            className={`text-xs ${numeroOrdenCompra.length > 0 && !numeroValido ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            Formato NNNN-NN.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="oc-fecha" className="text-sm font-medium">
            Fecha de emisión del cliente <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="oc-fecha"
            type="date"
            max={hoyIso()}
            value={fechaEmisionCliente}
            onChange={(e) => setFechaEmisionCliente(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="oc-observaciones" className="text-sm font-medium">
            Observaciones <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="oc-observaciones"
            rows={3}
            maxLength={500}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={crear.isPending}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={crear.isPending || cargando}
            className="inline-flex items-center gap-2 rounded-md bg-[#203f68] px-4 py-2 text-sm font-medium text-white hover:bg-[#203f68]/90 disabled:opacity-60"
          >
            {crear.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Registrar orden
          </button>
        </div>
      </form>
    </div>
  )
}
