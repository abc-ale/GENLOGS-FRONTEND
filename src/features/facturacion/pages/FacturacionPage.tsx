import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Filter, Loader2, Receipt } from 'lucide-react'
import { useFacturas } from '../hooks/useFacturacion'
import { facturacionApi } from '@/api/facturacionApi'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { PaginationBar } from '@/components/ui/PaginationBar'
import { normalizarCodigoMoneda } from '@/lib/formatters/currency'
import { EstadoFacturacion } from '@/types/facturacion.types'
import type { Factura, DetalleFacturacion } from '@/types/facturacion.types'
import logoGenlogs from '@/assets/GENLOGS.png'

async function logoComoDataUrl(): Promise<string> {
  const response = await fetch(logoGenlogs)
  if (!response.ok) throw new Error('No se pudo cargar el logo de la empresa.')
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo leer el logo.'))
    reader.onerror = () => reject(new Error('No se pudo leer el logo.'))
    reader.readAsDataURL(blob)
  })
}

async function generarPdfFacturacion(factura: Factura, lineas: DetalleFacturacion[]) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logo = await logoComoDataUrl()
  doc.addImage(logo, 'PNG', 14, 12, 48, 19)
  doc.setTextColor(22, 52, 91)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('REPORTE DE FACTURACIÓN', 14, 42)
  doc.setDrawColor(218, 228, 241)
  doc.line(14, 46, 196, 46)

  const moneda = normalizarCodigoMoneda(factura.moneda)
  const dinero = (valor: number | undefined) => `${moneda} ${Number(valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  doc.setTextColor(45, 55, 72)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Comprobante: ${factura.codigoComprobante || factura.numeroComprobante || '—'}`, 14, 55)
  doc.text(`Cliente: ${factura.clienteRazonSocial || factura.cliente || '—'}`, 14, 62)
  doc.text(`Orden de compra: ${factura.numeroOrdenCompra || `#${factura.idOrdenCompra}`}`, 14, 69)
  doc.text(`Fecha de emisión: ${factura.fechaEmision || '—'}`, 14, 76)
  doc.text(`Fecha de vencimiento: ${factura.fechaVencimiento || '—'}`, 108, 76)
  doc.text(`Estado: ${factura.estadoCodigo || factura.estado || '—'}`, 14, 83)

  autoTable(doc, {
    startY: 91,
    head: [['Descripción', 'Cant.', 'P. unitario', 'Descuento', 'Importe']],
    body: lineas.length ? lineas.map((linea) => [linea.descripcionPersonalizada || linea.productoNombre || linea.servicioNombre || 'Ítem', String(linea.cantidad ?? 0), dinero(linea.precioUnitario), dinero(linea.descuentoUnitario), dinero(linea.importeLinea)]) : [['Sin líneas registradas', '', '', '', '']],
    theme: 'grid',
    headStyles: { fillColor: [22, 52, 91], textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 248, 252] },
  })
  const finTabla = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 105
  const y = finTabla + 12
  doc.setFont('helvetica', 'normal')
  doc.text(`Total: ${dinero(factura.total)}`, 196, y, { align: 'right' })
  doc.text(`Pagado: ${dinero(factura.montoPagado)}`, 196, y + 7, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 52, 91)
  doc.text(`Saldo pendiente: ${dinero(factura.saldoPendiente ?? (factura.total - factura.montoPagado))}`, 196, y + 15, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120, 130, 145)
  doc.text('GENLOGS S.A.C. · RUC 20516185644', 14, 285)
  const filename = String(factura.codigoComprobante || factura.idFacturacion).replace(/[^a-zA-Z0-9_-]/g, '_')
  doc.save(`facturacion-${filename}.pdf`)
}

export function FacturacionPage() {
  const [pagina, setPagina] = useState(0)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [estadoCodigo, setEstadoCodigo] = useState<EstadoFacturacion | ''>('')
  const [descargandoId, setDescargandoId] = useState<number | null>(null)
  const TAMANO_PAGINA = 10
  const { data, isLoading, isError, refetch } = useFacturas({ estadoCodigo: estadoCodigo || undefined, page: pagina, size: TAMANO_PAGINA })
  const facturas = data?.content ?? []

  const descargarPdf = async (factura: Factura) => {
    try {
      setDescargandoId(factura.idFacturacion)
      const [detalle, completa] = await Promise.all([
        facturacionApi.listarDetalle(factura.idFacturacion),
        facturacionApi.obtener(factura.idFacturacion),
      ])
      await generarPdfFacturacion({ ...factura, ...completa }, detalle)
    } catch (error) {
      console.error('No se pudo generar el PDF de facturación:', error)
      window.alert(`No se pudo generar el PDF. ${error instanceof Error ? error.message : 'Verifica tu conexión e inténtalo nuevamente.'}`)
    } finally {
      setDescargandoId(null)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Facturación</h1>
        <p className="text-sm text-muted-foreground">Comprobantes, tipos y estados de emisión.</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <button type="button" onClick={() => setFiltrosAbiertos((abierto) => !abierto)} aria-expanded={filtrosAbiertos} className="flex w-full items-center gap-2 text-left font-medium text-foreground">
          <Filter className="h-4 w-4" aria-hidden="true" />Filtros {estadoCodigo && <span className="text-xs text-muted-foreground">(1)</span>}
        </button>
        {filtrosAbiertos && <div className="mt-4 max-w-sm border-t border-border pt-4">
          <label htmlFor="filtro-estado-factura" className="mb-2 block text-sm font-medium text-foreground">Estado</label>
          <select id="filtro-estado-factura" value={estadoCodigo} onChange={(e) => { setEstadoCodigo(e.target.value as EstadoFacturacion | ''); setPagina(0) }} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Todos los estados</option>
            <option value={EstadoFacturacion.EMITIDA}>Emitida</option><option value={EstadoFacturacion.PARCIAL}>Pago parcial</option><option value={EstadoFacturacion.PAGADA}>Pagada</option><option value={EstadoFacturacion.VENCIDA}>Vencida</option><option value={EstadoFacturacion.ANULADA}>Anulada</option>
          </select>
        </div>}
      </div>
      {isError && <ErrorBanner message="No se pudieron cargar los comprobantes." onRetry={() => refetch()} />}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted"><tr>
              <th className="p-3 font-medium text-muted-foreground">Comprobante</th><th className="p-3 font-medium text-muted-foreground">Cliente</th><th className="p-3 font-medium text-muted-foreground">Origen</th><th className="p-3 font-medium text-muted-foreground">Emisión</th><th className="p-3 font-medium text-muted-foreground">Estado</th><th className="p-3 text-center font-medium text-muted-foreground">PDF</th>
            </tr></thead>
            <tbody>
              {isLoading && <TableSkeletonRows columns={6} />}
              {!isLoading && !isError && facturas.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground"><Receipt className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />No hay comprobantes registrados.</td></tr>}
              {facturas.map((factura) => <tr key={factura.idFacturacion} className="border-t border-border hover:bg-muted/50">
                <td className="p-3 font-medium text-foreground">{factura.codigoComprobante}</td><td className="p-3">{factura.cliente ?? '—'}</td><td className="p-3"><Link to="/ordenes-compra" className="rounded text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Orden #{factura.idOrdenCompra}</Link></td><td className="p-3">{factura.fechaEmision}</td><td className="p-3">{factura.estadoCodigo ?? factura.idEstadoFacturacion}</td>
                <td className="p-3 text-center"><button type="button" onClick={() => void descargarPdf(factura)} disabled={descargandoId === factura.idFacturacion} title="Descargar reporte PDF" aria-label={`Descargar PDF ${factura.codigoComprobante}`} className="inline-flex rounded-lg p-2 text-accent transition hover:bg-accent/10 disabled:cursor-wait disabled:opacity-50">{descargandoId === factura.idFacturacion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationBar currentPage={pagina} totalPages={data?.totalPages ?? 0} totalItems={data?.totalElements ?? 0} pageSize={TAMANO_PAGINA} itemLabel="facturas" onPageChange={setPagina} />
    </section>
  )
}