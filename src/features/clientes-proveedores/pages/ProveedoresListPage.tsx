import { useState } from 'react'
import { Truck } from 'lucide-react'
import { useProveedores, useCrearProveedor } from '../hooks/useProveedores'
import { ProveedorForm } from '../components/ProveedorForm'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'

export default function ProveedoresListPage() {
  const { data = [], isLoading, isError } = useProveedores()
  const crear = useCrearProveedor()
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground">Los datos fiscales provienen de tercero.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          {mostrarForm ? 'Cerrar' : 'Nuevo proveedor'}
        </button>
      </header>

      {mostrarForm && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ProveedorForm
            isSubmitting={crear.isPending}
            serverError={crear.isError ? 'No se pudo guardar el proveedor.' : ''}
            onSubmit={(d) => crear.mutate(d, { onSuccess: () => setMostrarForm(false) })}
          />
        </div>
      )}

      {isError && <ErrorBanner message="No se pudo cargar la lista de proveedores." />}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Documento</th>
              <th className="p-3 font-medium">Razón social</th>
              <th className="p-3 font-medium">Dirección</th>
              <th className="p-3 font-medium">Correo</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows columns={4} />}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-muted-foreground">
                  <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  Aún no hay proveedores registrados.
                </td>
              </tr>
            )}
            {data.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                <td className="p-3">{p.tercero.tipoDocumento} {p.tercero.numeroDocumento}</td>
                <td className="p-3 font-medium text-foreground">{p.tercero.razonSocial}</td>
                <td className="p-3">{p.tercero.direccion || '—'}</td>
                <td className="p-3">{p.tercero.email || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </main>
  )
}
