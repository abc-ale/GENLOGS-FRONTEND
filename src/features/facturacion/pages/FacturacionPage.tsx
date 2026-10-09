import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { useFacturas } from '../hooks/useFacturacion'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { DescargarPdfButton } from '@/components/ui/DescargarPdfButton'

export function FacturacionPage() {
  const { data, isLoading, isError, refetch } = useFacturas()
  const facturas = data?.content ?? []

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Facturación</h1>
        <p className="text-sm text-muted-foreground">Comprobantes, tipos y estados de emisión.</p>
      </header>

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
              <th className="p-3 text-right font-medium text-muted-foreground">PDF</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows columns={6} />}
            {!isLoading && !isError && facturas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
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
                <td className="p-3 text-right">
                  <DescargarPdfButton tipo="factura" id={factura.idFacturacion} label="Descargar factura" variant="compact" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}