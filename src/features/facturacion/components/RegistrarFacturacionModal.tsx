import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Loader2, Trash2 } from 'lucide-react'
import { useCatalogosFacturacion, useCrearFactura } from '../hooks/useFacturacion'
import { useOrdenesCompra } from '@/features/ordenes-compra/hooks/useOrdenesCompra'
import { useCotizacion } from '@/features/cotizaciones/hooks/useCotizaciones'
import { EstadoOrdenCompra } from '@/types/ordenCompra.types'
import type { LineaFacturaInput } from '@/types/facturacion.types'

/** Tasa total aplicable usada por el backend (FACTOR_IGV = 1.18). */
const TASA_IGV = 0.18
/** Serie SUNAT: 4 caracteres alfanuméricos (p. ej. F001, B001). */
const FORMATO_SERIE = /^[A-Z0-9]{4}$/
/** Número correlativo: hasta 8 dígitos. */
const FORMATO_NUMERO = /^\d{1,8}$/

interface LineaEditable extends LineaFacturaInput {
  clave: string
  descripcion: string
}

interface RegistrarFacturacionModalProps {
  onClose: () => void
  onRegistrada?: (comprobante: string) => void
}

function hoyIso(): string {
  const ahora = new Date()
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

function importeLinea(linea: LineaFacturaInput): number {
  return redondear(linea.cantidad * (linea.precioUnitario - (linea.descuentoUnitario ?? 0)))
}

function mensajeError(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
  }
  return 'No se pudo registrar la facturación. Inténtalo de nuevo.'
}

/**
 * Registro manual de la facturación de una orden de compra (RF-36, RF-37, CU-23):
 * comprobante con serie y número únicos, líneas tomadas de la cotización de origen
 * y cálculo del IGV. La facturación nace en estado EMITIDA (lo asigna el backend).
 */
export function RegistrarFacturacionModal({ onClose, onRegistrada }: RegistrarFacturacionModalProps) {
  const [idOrdenCompra, setIdOrdenCompra] = useState('')
  const [idTipoComprobante, setIdTipoComprobante] = useState('')
  const [idMoneda, setIdMoneda] = useState('')
  const [idCondicionPago, setIdCondicionPago] = useState('')
  const [serie, setSerie] = useState('')
  const [numero, setNumero] = useState('')
  const [fechaEmision, setFechaEmision] = useState(hoyIso())
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [lineas, setLineas] = useState<LineaEditable[]>([])
  const [error, setError] = useState<string | null>(null)

  const catalogos = useCatalogosFacturacion()
  const ordenes = useOrdenesCompra({ size: 100 })
  const crear = useCrearFactura()

  const ordenesFacturables = useMemo(
    () => (ordenes.data?.content ?? []).filter((o) => o.estadoCodigo !== EstadoOrdenCompra.ANULADA),
    [ordenes.data],
  )
  const orden = ordenesFacturables.find((o) => String(o.idOrdenCompra) === idOrdenCompra)
  const cotizacion = useCotizacion(orden?.idCotizacion)
  const tipo = catalogos.tipos.find((t) => String(t.idTipoComprobante) === idTipoComprobante)

  // Al llegar la cotización de la orden elegida se copian sus líneas (una sola vez por cotización).
  const [cotizacionCopiada, setCotizacionCopiada] = useState(cotizacion.data)
  if (cotizacion.data && cotizacion.data !== cotizacionCopiada) {
    setCotizacionCopiada(cotizacion.data)
    setLineas(
      cotizacion.data.detalles
        .filter((d) => d.idProducto != null || d.idServicio != null)
        .map((d, indice) => ({
          clave: `${d.idCotizacionDetalle ?? indice}-${indice}`,
          descripcion: d.descripcion || d.producto || d.servicio || 'Ítem',
          idProducto: d.idProducto ?? undefined,
          idServicio: d.idProducto == null ? (d.idServicio ?? undefined) : undefined,
          descripcionPersonalizada: d.descripcionPersonalizada ?? undefined,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          descuentoUnitario: Number(d.descuentoUnitario ?? 0),
        })),
    )
  }

  // Moneda y condición de pago: se sugieren las de la cotización mientras el usuario no elija otras.
  const datosCotizacion = orden ? cotizacion.data : undefined
  const codigoMonedaCotizacion = String(datosCotizacion?.monedaCodigo ?? datosCotizacion?.moneda ?? '').toUpperCase()
  const monedaSugerida = datosCotizacion
    ? catalogos.monedas.find((m) => m.codigoMoneda.toUpperCase() === codigoMonedaCotizacion)
    : undefined
  const condicionSugerida = datosCotizacion
    ? catalogos.condiciones.find((c) => normalizar(c.nombreCondicion) === normalizar(String(datosCotizacion.condicionPago ?? '')))
    : undefined
  const idMonedaFinal = idMoneda || (monedaSugerida ? String(monedaSugerida.idMoneda) : '')
  const idCondicionFinal = idCondicionPago || (condicionSugerida ? String(condicionSugerida.idCondicionPago) : '')
  const moneda = catalogos.monedas.find((m) => String(m.idMoneda) === idMonedaFinal)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !crear.isPending) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, crear.isPending])

  const subtotal = redondear(lineas.reduce((suma, l) => suma + importeLinea(l), 0))
  const igv = redondear(subtotal * TASA_IGV)
  const total = redondear(subtotal + igv)
  const simbolo = moneda?.simbolo ?? ''

  function cambiarTipo(valor: string) {
    setIdTipoComprobante(valor)
    const nuevo = catalogos.tipos.find((t) => String(t.idTipoComprobante) === valor)
    // Sugiere la serie con el prefijo del tipo (F para factura, B para boleta…).
    if (nuevo?.seriePrefijo && !serie.startsWith(nuevo.seriePrefijo)) setSerie(nuevo.seriePrefijo)
  }

  function actualizarLinea(clave: string, campo: 'cantidad' | 'precioUnitario' | 'descuentoUnitario', valor: string) {
    const numeroValor = valor === '' ? 0 : Number(valor)
    setLineas((actuales) => actuales.map((l) => (l.clave === clave ? { ...l, [campo]: numeroValor } : l)))
  }

  function validar(): string | null {
    if (!orden) return 'Selecciona la orden de compra a facturar.'
    if (!tipo) return 'Selecciona el tipo de comprobante.'
    if (!FORMATO_SERIE.test(serie)) return 'La serie debe tener 4 caracteres alfanuméricos (por ejemplo, F001).'
    if (tipo.seriePrefijo && !serie.startsWith(tipo.seriePrefijo)) {
      return `La serie de un comprobante ${tipo.nombreTipo} debe empezar con «${tipo.seriePrefijo}».`
    }
    if (!FORMATO_NUMERO.test(numero)) return 'El número del comprobante debe tener entre 1 y 8 dígitos.'
    if (!idMonedaFinal) return 'Selecciona la moneda.'
    if (!idCondicionFinal) return 'Selecciona la condición de pago.'
    if (fechaVencimiento && fechaVencimiento < fechaEmision) {
      return 'La fecha de vencimiento no puede ser anterior a la de emisión.'
    }
    if (lineas.length === 0) return 'La facturación debe tener al menos una línea.'
    for (const l of lineas) {
      if (!(l.cantidad > 0)) return `La cantidad de «${l.descripcion}» debe ser mayor que cero.`
      if (l.precioUnitario < 0) return `El precio de «${l.descripcion}» no puede ser negativo.`
      const descuento = l.descuentoUnitario ?? 0
      if (descuento < 0 || descuento > l.precioUnitario) {
        return `El descuento de «${l.descripcion}» debe estar entre 0 y el precio unitario.`
      }
    }
    return null
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const invalido = validar()
    if (invalido) {
      setError(invalido)
      return
    }
    setError(null)

    try {
      await crear.mutateAsync({
        idOrdenCompra: Number(idOrdenCompra),
        idTipoComprobante: Number(idTipoComprobante),
        idMoneda: Number(idMonedaFinal),
        idCondicionPago: Number(idCondicionFinal),
        serieComprobante: serie,
        numeroComprobante: numero,
        fechaEmision: fechaEmision || undefined,
        fechaVencimiento: fechaVencimiento || undefined,
        lineas: lineas.map((l) => ({
          idProducto: l.idProducto,
          idServicio: l.idServicio,
          descripcionPersonalizada: l.descripcionPersonalizada,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          descuentoUnitario: l.descuentoUnitario,
        })),
      })
      onRegistrada?.(`${serie}-${numero}`)
      onClose()
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  const campo = 'h-10 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60'
  const cargandoCatalogos = catalogos.isLoading || ordenes.isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-registrar-facturacion"
        onSubmit={handleSubmit}
        className="my-8 w-full max-w-3xl space-y-5 rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <header className="space-y-1">
          <h2 id="titulo-registrar-facturacion" className="text-lg font-semibold text-foreground">
            Registrar facturación
          </h2>
          <p className="text-sm text-muted-foreground">
            Las líneas se copian de la cotización de la orden; puedes ajustarlas o quitar las que no se facturan.
            El comprobante se registra en estado Emitida.
          </p>
        </header>

        {(catalogos.isError || ordenes.isError) && (
          <p role="alert" className="text-sm text-destructive">
            No se pudieron cargar los datos del formulario. Cierra y vuelve a intentarlo.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="fac-orden" className="text-sm font-medium">Orden de compra</label>
            <select
              id="fac-orden"
              required
              disabled={cargandoCatalogos}
              value={idOrdenCompra}
              onChange={(e) => {
                setIdOrdenCompra(e.target.value)
                setLineas([])
                // Vuelve a sugerir la moneda y la condición de la nueva cotización.
                setIdMoneda('')
                setIdCondicionPago('')
                setCotizacionCopiada(undefined)
              }}
              className={campo}
            >
              <option value="">{cargandoCatalogos ? 'Cargando…' : 'Selecciona una orden de compra'}</option>
              {ordenesFacturables.map((o) => (
                <option key={o.idOrdenCompra} value={String(o.idOrdenCompra)}>
                  {o.numeroOrdenCompra} — {o.cliente ?? 'Sin cliente'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="fac-tipo" className="text-sm font-medium">Tipo de comprobante</label>
            <select id="fac-tipo" required value={idTipoComprobante} onChange={(e) => cambiarTipo(e.target.value)} className={campo}>
              <option value="">Selecciona un tipo</option>
              {catalogos.tipos.map((t) => (
                <option key={t.idTipoComprobante} value={String(t.idTipoComprobante)}>{t.nombreTipo}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[1fr_1.5fr] gap-2">
            <div className="space-y-1">
              <label htmlFor="fac-serie" className="text-sm font-medium">Serie</label>
              <input
                id="fac-serie"
                required
                maxLength={4}
                placeholder="F001"
                value={serie}
                onChange={(e) => setSerie(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className={campo}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fac-numero" className="text-sm font-medium">Número</label>
              <input
                id="fac-numero"
                required
                inputMode="numeric"
                maxLength={8}
                placeholder="00000001"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
                className={campo}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="fac-moneda" className="text-sm font-medium">Moneda</label>
            <select id="fac-moneda" required value={idMonedaFinal} onChange={(e) => setIdMoneda(e.target.value)} className={campo}>
              <option value="">Selecciona una moneda</option>
              {catalogos.monedas.map((m) => (
                <option key={m.idMoneda} value={String(m.idMoneda)}>{m.codigoMoneda} — {m.nombreMoneda}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="fac-condicion" className="text-sm font-medium">Condición de pago</label>
            <select id="fac-condicion" required value={idCondicionFinal} onChange={(e) => setIdCondicionPago(e.target.value)} className={campo}>
              <option value="">Selecciona una condición</option>
              {catalogos.condiciones.map((c) => (
                <option key={c.idCondicionPago} value={String(c.idCondicionPago)}>{c.nombreCondicion}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="fac-emision" className="text-sm font-medium">Fecha de emisión</label>
            <input id="fac-emision" type="date" required max={hoyIso()} value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} className={campo} />
          </div>

          <div className="space-y-1">
            <label htmlFor="fac-vencimiento" className="text-sm font-medium">
              Fecha de vencimiento <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="fac-vencimiento"
              type="date"
              min={fechaEmision || undefined}
              aria-describedby="fac-vencimiento-ayuda"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className={campo}
            />
            <p id="fac-vencimiento-ayuda" className="text-xs text-muted-foreground">
              Si la dejas vacía se calcula con los días de crédito de la condición de pago.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Líneas</h3>
          {orden && cotizacion.isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando líneas de la cotización…
            </p>
          )}
          {!orden && <p className="text-sm text-muted-foreground">Selecciona una orden de compra para cargar sus líneas.</p>}
          {orden && !cotizacion.isLoading && lineas.length === 0 && (
            <p className="text-sm text-muted-foreground">La cotización de esta orden no tiene líneas facturables.</p>
          )}

          {lineas.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 font-medium text-muted-foreground">Descripción</th>
                    <th className="w-24 p-2 font-medium text-muted-foreground">Cantidad</th>
                    <th className="w-28 p-2 font-medium text-muted-foreground">P. unitario</th>
                    <th className="w-28 p-2 font-medium text-muted-foreground">Descuento</th>
                    <th className="w-28 p-2 text-right font-medium text-muted-foreground">Importe</th>
                    <th className="w-10 p-2"><span className="sr-only">Quitar</span></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l) => (
                    <tr key={l.clave} className="border-t border-border">
                      <td className="p-2">{l.descripcion}</td>
                      {(['cantidad', 'precioUnitario', 'descuentoUnitario'] as const).map((c) => (
                        <td key={c} className="p-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            aria-label={`${c === 'cantidad' ? 'Cantidad' : c === 'precioUnitario' ? 'Precio unitario' : 'Descuento unitario'} de ${l.descripcion}`}
                            value={l[c] ?? 0}
                            onChange={(e) => actualizarLinea(l.clave, c, e.target.value)}
                            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                          />
                        </td>
                      ))}
                      <td className="p-2 text-right tabular-nums">{simbolo} {importeLinea(l).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => setLineas((actuales) => actuales.filter((x) => x.clave !== l.clave))}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                          aria-label={`Quitar ${l.descripcion}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <dl className="ml-auto grid w-full max-w-xs grid-cols-2 gap-1 text-sm">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-right tabular-nums">{simbolo} {subtotal.toFixed(2)}</dd>
            <dt className="text-muted-foreground">IGV (18 %)</dt>
            <dd className="text-right tabular-nums">{simbolo} {igv.toFixed(2)}</dd>
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold tabular-nums">{simbolo} {total.toFixed(2)}</dd>
          </dl>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
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
            disabled={crear.isPending || cargandoCatalogos}
            className="inline-flex items-center gap-2 rounded-md bg-[#203f68] px-4 py-2 text-sm font-medium text-white hover:bg-[#203f68]/90 disabled:opacity-60"
          >
            {crear.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Registrar facturación
          </button>
        </div>
      </form>
    </div>
  )
}
