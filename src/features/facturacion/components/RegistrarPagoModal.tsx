import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useRegistrarPagoFactura } from '../hooks/useFacturacion'
import type { Factura } from '@/types/facturacion.types'

interface RegistrarPagoModalProps {
  factura: Factura
  onClose: () => void
  onRegistrado?: (mensaje: string) => void
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

/** Saldo que falta cobrar; si el backend no lo envía se calcula con total - pagado. */
function saldoDe(factura: Factura): number {
  const saldo = factura.saldoPendiente ?? Number(factura.total ?? 0) - Number(factura.montoPagado ?? 0)
  return redondear(Math.max(0, Number(saldo)))
}

function mensajeError(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
  }
  return 'No se pudo registrar el pago. Inténtalo de nuevo.'
}

/**
 * Registro de un pago parcial o total de la facturación (RF-39, CU-24).
 * El monto no puede superar el saldo; el backend deja el comprobante en
 * PARCIAL o PAGADA según el monto acumulado.
 */
export function RegistrarPagoModal({ factura, onClose, onRegistrado }: RegistrarPagoModalProps) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const registrar = useRegistrarPagoFactura()

  const total = redondear(Number(factura.total ?? 0))
  const pagado = redondear(Number(factura.montoPagado ?? 0))
  const saldo = saldoDe(factura)
  const simbolo = factura.moneda ?? ''
  const montoNumero = Number(monto)
  const saldoTras = redondear(saldo - (Number.isFinite(montoNumero) ? montoNumero : 0))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !registrar.isPending) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, registrar.isPending])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!(montoNumero > 0)) {
      setError('Ingresa un monto mayor que cero.')
      return
    }
    if (redondear(montoNumero) !== montoNumero) {
      setError('El monto admite como máximo 2 decimales.')
      return
    }
    if (montoNumero > saldo) {
      setError(`El monto no puede superar el saldo pendiente (${simbolo} ${saldo.toFixed(2)}).`)
      return
    }
    setError(null)

    try {
      const actualizada = await registrar.mutateAsync({ id: factura.idFacturacion, monto: montoNumero })
      const estado = actualizada.estadoCodigo === 'PAGADA' ? 'Pagada' : 'Pago parcial'
      onRegistrado?.(
        `Pago de ${simbolo} ${montoNumero.toFixed(2)} registrado en ${factura.codigoComprobante}. Estado: ${estado}.`,
      )
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
        aria-labelledby="titulo-registrar-pago"
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <header className="space-y-1">
          <h2 id="titulo-registrar-pago" className="text-lg font-semibold text-foreground">
            Registrar pago
          </h2>
          <p className="text-sm text-muted-foreground">
            Comprobante {factura.codigoComprobante} · {factura.cliente ?? 'Sin cliente'}
          </p>
        </header>

        <dl className="grid grid-cols-2 gap-1 rounded-md bg-muted/50 p-3 text-sm">
          <dt className="text-muted-foreground">Total</dt>
          <dd className="text-right tabular-nums">{simbolo} {total.toFixed(2)}</dd>
          <dt className="text-muted-foreground">Pagado</dt>
          <dd className="text-right tabular-nums">{simbolo} {pagado.toFixed(2)}</dd>
          <dt className="font-semibold">Saldo pendiente</dt>
          <dd className="text-right font-semibold tabular-nums">{simbolo} {saldo.toFixed(2)}</dd>
        </dl>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="pago-monto" className="text-sm font-medium">Monto del pago</label>
            <button
              type="button"
              onClick={() => setMonto(saldo.toFixed(2))}
              className="text-xs font-medium text-accent hover:underline"
            >
              Pagar el saldo completo
            </button>
          </div>
          <input
            id="pago-monto"
            type="number"
            required
            min={0.01}
            max={saldo}
            step="0.01"
            inputMode="decimal"
            autoFocus
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            aria-describedby="pago-monto-ayuda"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums"
          />
          <p id="pago-monto-ayuda" className="text-xs text-muted-foreground">
            {montoNumero > 0 && montoNumero <= saldo
              ? saldoTras === 0
                ? 'Con este pago el comprobante queda Pagado.'
                : `Quedará un saldo de ${simbolo} ${saldoTras.toFixed(2)} (Pago parcial).`
              : 'Puede ser un pago parcial o el total del saldo.'}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={registrar.isPending}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={registrar.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-[#203f68] px-4 py-2 text-sm font-medium text-white hover:bg-[#203f68]/90 disabled:opacity-60"
          >
            {registrar.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Registrar pago
          </button>
        </div>
      </form>
    </div>
  )
}
