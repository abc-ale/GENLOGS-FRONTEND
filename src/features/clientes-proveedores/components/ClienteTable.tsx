import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { Cliente, FiltrosCliente } from '../../../types/cliente.types'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
interface Props { clientes: Cliente[]; filtros: FiltrosCliente; onFiltrosChange: (f: FiltrosCliente) => void; isLoading?: boolean }
const ctl = 'h-10 w-full sm:w-96 rounded-lg border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
export function ClienteTable({ clientes, filtros, onFiltrosChange, isLoading }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
        <input
          className={ctl}
          placeholder="Buscar por DNI, RUC o razón social"
          value={filtros.documento ?? filtros.razonSocial ?? ''}
          onChange={(e) => onFiltrosChange({ ...filtros, documento: e.target.value, razonSocial: e.target.value })}
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Documento</th>
              <th className="p-3 font-medium">Razón social</th>
              <th className="p-3 font-medium">Dirección</th>
              <th className="p-3 font-medium">Empresas mineras</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows columns={4} />}
            {!isLoading && clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No hay clientes registrados.
                </td>
              </tr>
            )}
            {clientes.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                <td className="p-3">{c.tercero.tipoDocumento} {c.tercero.numeroDocumento}</td>
                <td className="p-3">
                  <Link to={`/clientes/${c.id}`} className="font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">{c.tercero.razonSocial}</Link>
                  {c.tercero.nombreComercial && <div className="text-xs text-muted-foreground">{c.tercero.nombreComercial}</div>}
                </td>
                <td className="p-3">{c.tercero.direccion || '—'}</td>
                <td className="p-3">{c.empresasMineras.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
