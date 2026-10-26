import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, ShoppingCart } from 'lucide-react'
import { useOrdenesCompra } from '../hooks/useOrdenesCompra'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { PaginationBar } from '@/components/ui/PaginationBar'
import { EstadoOrdenCompra } from '@/types/ordenCompra.types'

export function OrdenesCompraPage() {
  const [paginaActual, setPaginaActual] = useState(0)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [estadoCodigo, setEstadoCodigo] = useState<EstadoOrdenCompra | ''>('')
  const tamanioPagina = 10
  const { data, isLoading, isError, refetch } = useOrdenesCompra({ estadoCodigo: estadoCodigo || undefined, page: paginaActual, size: tamanioPagina })
  const ordenes = data?.content ?? []

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Órdenes de compra</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona la orden de compra que reemplaza el número de orden legado de la cotización.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <button type="button" onClick={() => setFiltrosAbiertos(abierto => !abierto)} aria-expanded={filtrosAbiertos} className="flex w-full items-center gap-2 text-left font-medium text-foreground">
          <Filter className="h-4 w-4" aria-hidden="true" />Filtros {estadoCodigo && <span className="text-xs text-muted-foreground">(1)</span>}
        </button>
        {filtrosAbiertos && <div className="mt-4 max-w-sm border-t border-border pt-4">
          <label htmlFor="filtro-estado-orden" className="mb-2 block text-sm font-medium text-foreground">Estado</label>
          <select id="filtro-estado-orden" value={estadoCodigo} onChange={e => { setEstadoCodigo(e.target.value as EstadoOrdenCompra | ''); setPaginaActual(0) }} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Todos los estados</option>
            <option value={EstadoOrdenCompra.RECIBIDA}>Recibida</option>
            <option value={EstadoOrdenCompra.EN_ATENCION}>En atención</option>
            <option value={EstadoOrdenCompra.ATENDIDA}>Atendida</option>
            <option value={EstadoOrdenCompra.ANULADA}>Anulada</option>
          </select>
        </div>}
      </div>
      {isError && (
        <ErrorBanner message="No se pudieron cargar las órdenes de compra." onRetry={() => refetch()} />
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 font-medium text-muted-foreground">Número</th>
              <th className="p-3 font-medium text-muted-foreground">Cliente</th>
              <th className="p-3 font-medium text-muted-foreground">Origen</th>
              <th className="p-3 font-medium text-muted-foreground">Emisión</th>
              <th className="p-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows columns={5} />}
            {!isLoading && !isError && ordenes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                  <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No hay órdenes registradas.
                </td>
              </tr>
            )}
            {ordenes.map((orden) => (
              <tr key={orden.idOrdenCompra} className="border-t border-border hover:bg-muted/50">
                <td className="p-3 font-medium text-foreground">{orden.numeroOrdenCompra}</td>
                <td className="p-3">{orden.cliente ?? '—'}</td>
                <td className="p-3">
                  {/* Vínculo explícito con la cotización de origen — la
                      lógica de UX del proyecto lo pide como link, no solo
                      como texto o ID suelto. */}
                  <Link
                    to={`/cotizaciones/${orden.idCotizacion}`}
                    className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    Cotización #{orden.idCotizacion}
                  </Link>
                </td>
                <td className="p-3">{orden.fechaRecepcion}</td>
                <td className="p-3">{orden.estadoCodigo ?? orden.idEstadoOrdenCompra}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <PaginationBar currentPage={paginaActual} totalPages={data?.totalPages ?? 0} totalItems={data?.totalElements ?? 0} pageSize={tamanioPagina} itemLabel="órdenes de compra" onPageChange={setPaginaActual} busy={isLoading} />
    </section>
  )
}