import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { ClienteTable } from '../components/ClienteTable';
import { ClienteForm } from '../components/ClienteForm';
import { useClientes } from '../hooks/useClientes';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useCrearCliente } from '../hooks/useCrearCliente';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import type { FiltrosCliente } from '../../../types/cliente.types';

export default function ClientesListPage() {
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [debounced] = useDebounce(filtros, 300);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pagina, setPagina] = useState(0);
  const TAMANO_PAGINA = 10;
  const { data = [], isLoading, isError } = useClientes({ ...debounced, page: 0, size: 500 });
  const crear = useCrearCliente();
  const clientesPagina = data.slice(pagina * TAMANO_PAGINA, (pagina + 1) * TAMANO_PAGINA);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">Administra la cartera de clientes y sus contactos.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          {mostrarForm ? 'Cerrar' : 'Nuevo cliente'}
        </button>
      </header>

      {mostrarForm && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ClienteForm
            isSubmitting={crear.isPending}
            serverError={crear.isError ? 'No se pudo guardar el cliente. Revisa los datos e intenta de nuevo.' : undefined}
            onSubmit={(d) => crear.mutate(d, { onSuccess: () => setMostrarForm(false) })}
          />
        </div>
      )}

      {isError && <ErrorBanner message="No se pudo cargar la lista de clientes." />}
      <ClienteTable clientes={clientesPagina} filtros={filtros} onFiltrosChange={(nuevos) => { setFiltros(nuevos); setPagina(0); }} isLoading={isLoading} />
      <PaginationBar currentPage={pagina} totalPages={Math.ceil(data.length / TAMANO_PAGINA)} totalItems={data.length} pageSize={TAMANO_PAGINA} itemLabel="clientes" onPageChange={setPagina} />
    </main>
  );
}



