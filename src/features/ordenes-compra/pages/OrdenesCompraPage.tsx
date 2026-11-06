import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useOrdenesCompra } from '../hooks/useOrdenesCompra'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { PaginationBar } from '@/components/ui/PaginationBar'
import { EstadoOrdenCompra } from '@/types/ordenCompra.types'

export function OrdenesCompraPage() {
  const [paginaActual, setPaginaActual] = useState(0)
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

      <div role="group" aria-label="Filtrar órdenes por estado" className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: '', label: 'Todas' },
          { value: EstadoOrdenCompra.RECIBIDA, label: 'Recibidas' },
          { value: EstadoOrdenCompra.EN_ATENCION, label: 'En atención' },
          { value: EstadoOrdenCompra.ATENDIDA, label: 'Atendidas' },
          { value: EstadoOrdenCompra.ANULADA, label: 'Anuladas' },
        ].map((opcion) => {
          const activo = estadoCodigo === opcion.value
          return <button key={opcion.value || 'todas'} type="button" aria-pressed={activo} onClick={() => { setEstadoCodigo(opcion.value as EstadoOrdenCompra | ''); setPaginaActual(0) }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${activo ? 'border-[#203f68] bg-[#203f68] text-white shadow-sm' : 'border-border bg-card text-foreground hover:border-[#203f68]/40 hover:bg-muted'}`}>
            {opcion.label}{!opcion.value && !estadoCodigo && data ? ` ${data.totalElements}` : ''}
          </button>
        })}
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