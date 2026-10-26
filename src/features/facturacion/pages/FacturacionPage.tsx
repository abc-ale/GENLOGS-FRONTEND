import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Receipt } from 'lucide-react'
import { useFacturas } from '../hooks/useFacturacion'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { PaginationBar } from '@/components/ui/PaginationBar'
import { EstadoFacturacion } from '@/types/facturacion.types'

export function FacturacionPage() {
  const [pagina, setPagina] = useState(0)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [estadoCodigo, setEstadoCodigo] = useState<EstadoFacturacion | ''>('')
  const TAMANO_PAGINA = 10
  const { data, isLoading, isError, refetch } = useFacturas({ estadoCodigo: estadoCodigo || undefined, page: pagina, size: TAMANO_PAGINA })
  const facturas = data?.content ?? []

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Facturación</h1>
        <p className="text-sm text-muted-foreground">Comprobantes, tipos y estados de emisión.</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <button type="button" onClick={() => setFiltrosAbiertos(abierto => !abierto)} aria-expanded={filtrosAbiertos} className="flex w-full items-center gap-2 text-left font-medium text-foreground">
          <Filter className="h-4 w-4" aria-hidden="true" />Filtros {estadoCodigo && <span className="text-xs text-muted-foreground">(1)</span>}
        </button>
        {filtrosAbiertos && <div className="mt-4 max-w-sm border-t border-border pt-4">
          <label htmlFor="filtro-estado-factura" className="mb-2 block text-sm font-medium text-foreground">Estado</label>
          <select id="filtro-estado-factura" value={estadoCodigo} onChange={e => { setEstadoCodigo(e.target.value as EstadoFacturacion | ''); setPagina(0) }} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Todos los estados</option>
            <option value={EstadoFacturacion.EMITIDA}>Emitida</option>
            <option value={EstadoFacturacion.PARCIAL}>Pago parcial</option>
            <option value={EstadoFacturacion.PAGADA}>Pagada</option>
            <option value={EstadoFacturacion.VENCIDA}>Vencida</option>
            <option value={EstadoFacturacion.ANULADA}>Anulada</option>
          </select>
        </div>}
      </div>
      {isError && (
        <ErrorBanner message="No se pudieron cargar los comprobantes." onRetry={() => refetch()} />
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 font-medium text-muted-foreground">Comprobante</th>
              <th className="p-3 font-medium text-muted-foreground">Cliente</th>
              <th className="p-3 font-medium text-muted-foreground">Origen</th>
              <th className="p-3 font-medium text-muted-foreground">Emisión</th>
              <th className="p-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows columns={5} />}
            {!isLoading && !isError && facturas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                  <Receipt className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No hay comprobantes registrados.
                </td>
              </tr>
            )}
            {facturas.map((factura) => (
              <tr key={factura.idFacturacion} className="border-t border-border hover:bg-muted/50">
                <td className="p-3 font-medium text-foreground">{factura.codigoComprobante}</td>
                <td className="p-3">{factura.cliente ?? '—'}</td>
                <td className="p-3">
                  {/* Aún no existe una pantalla de detalle por orden, así que
                      el link va al módulo (lista) — cuando exista el detalle,
                      apuntar directo a /ordenes-compra/{id}. */}
                  <Link
                    to="/ordenes-compra"
                    className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    Orden #{factura.idOrdenCompra}
                  </Link>
                </td>
                <td className="p-3">{factura.fechaEmision}</td>
                <td className="p-3">{factura.estadoCodigo ?? factura.idEstadoFacturacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <PaginationBar currentPage={pagina} totalPages={data?.totalPages ?? 0} totalItems={data?.totalElements ?? 0} pageSize={TAMANO_PAGINA} itemLabel="facturas" onPageChange={setPagina} />
    </section>
  )
}