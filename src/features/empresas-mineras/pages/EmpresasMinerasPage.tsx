import { Building2 } from 'lucide-react'
import { useEmpresasMineras } from '../hooks/useEmpresasMineras'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'

export function EmpresasMinerasPage() {
  const { data = [], isLoading, isError } = useEmpresasMineras()

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Empresas mineras</h1>
        <p className="text-sm text-muted-foreground">Empresas georreferenciadas asociadas a clientes y minerales.</p>
      </header>

      {isError && <ErrorBanner message="No se pudieron cargar las empresas mineras." />}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Empresa</th>
              <th className="p-3 font-medium">Cliente</th>
              <th className="p-3 font-medium">Ubicación</th>
              <th className="p-3 font-medium">Minerales</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows columns={4} />}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-muted-foreground">
                  <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No hay empresas mineras registradas.
                </td>
              </tr>
            )}
            {data.map((empresa) => (
              <tr key={empresa.idEmpresaMinera} className="border-t border-border hover:bg-muted/50">
                <td className="p-3 font-medium text-foreground">{empresa.nombreUnidadMinera}</td>
                <td className="p-3">{empresa.idCliente}</td>
                <td className="p-3">
                  {empresa.latitud != null && empresa.longitud != null
                    ? `${empresa.latitud}, ${empresa.longitud}`
                    : 'Sin coordenadas'}
                </td>
                <td className="p-3">{empresa.minerales.map((m) => m.mineral?.nombreMineral).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}
