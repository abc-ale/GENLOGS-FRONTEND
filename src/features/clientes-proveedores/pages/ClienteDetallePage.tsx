import { Link, useParams } from 'react-router-dom'
import { useCliente } from '../hooks/useClientes'
import { ContactoClienteList } from '../components/ContactoClienteList'

export default function ClienteDetallePage() {
  const id = Number(useParams().id)
  const { data: cliente, isLoading, isError } = useCliente(id)

  if (isLoading) return <p className="p-6 text-muted-foreground">Cargando cliente…</p>
  if (isError || !cliente) return <p role="alert" className="p-6 text-destructive">No se encontró el cliente.</p>

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <Link
        to="/clientes"
        className="text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Volver a clientes
      </Link>

      <header>
        <h1 className="text-2xl font-semibold text-foreground">{cliente.tercero.razonSocial}</h1>
        <p className="text-sm text-muted-foreground">
          {cliente.tercero.tipoDocumento} {cliente.tercero.numeroDocumento}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
        <div>
          <dt className="text-muted-foreground">Nombre comercial</dt>
          <dd>{cliente.tercero.nombreComercial || '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dirección</dt>
          <dd>{cliente.tercero.direccion || '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd>{cliente.tercero.telefono || '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Correo</dt>
          <dd>{cliente.tercero.email || '—'}</dd>
        </div>
      </dl>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Empresas mineras asociadas</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {cliente.empresasMineras.map((empresa) => (
            <li key={empresa.id}>
              {empresa.nombre}{' '}
              {empresa.latitud != null && empresa.longitud != null
                ? `(${empresa.latitud}, ${empresa.longitud})`
                : ''}
            </li>
          ))}
          {cliente.empresasMineras.length === 0 && <li className="text-muted-foreground">No hay empresas mineras asociadas.</li>}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Contactos</h2>
        <ContactoClienteList clienteId={cliente.id} contactos={cliente.contactos ?? []} />
      </div>
    </main>
  )
}
