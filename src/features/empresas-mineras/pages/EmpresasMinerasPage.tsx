import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Plus } from 'lucide-react'
import { useEmpresasMineras } from '../hooks/useEmpresasMineras'
import { MapaUnidades, type PuntoMapa } from '../components/MapaUnidades'
import { CrearUnidadMineraDialog } from '../components/CrearUnidadMineraDialog'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { cn } from '@/lib/utils/utils'
import type { EmpresaMinera } from '@/types/empresaMinera.types'

/** Un color por familia de etapa comercial, el MISMO en el mapa, la leyenda,
 *  la lista, la ficha y la tabla (verde producción, azul construcción/desarrollo,
 *  ámbar exploración, azul marino cierre). El nombre viene del backend
 *  (`nombreEtapa`), así que se reconoce por contenido sobre el texto
 *  normalizado (minúsculas y sin acentos). */
const FAMILIAS_ETAPA: ReadonlyArray<{ patron: RegExp; color: string; clases: string }> = [
  { patron: /producc/, color: '#16a34a', clases: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  { patron: /(construcc|desarroll)/, color: '#2563eb', clases: 'bg-blue-50 text-blue-700 border border-blue-200' },
  { patron: /explorac/, color: '#d97706', clases: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { patron: /cierre/, color: '#475569', clases: 'bg-slate-100 text-slate-700 border border-slate-300' },
]
const COLOR_SIN_ETAPA = '#94a3b8'

const familiaDe = (nombre?: string) => {
  if (!nombre) return undefined
  const texto = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return FAMILIAS_ETAPA.find(({ patron }) => patron.test(texto))
}
const clasesDeEtapa = (nombre?: string) => familiaDe(nombre)?.clases

// w-full en móvil: sin ancho fijo, el select toma el ancho del cliente con el nombre más largo y se sale de la pantalla.
const selectClass =
  'h-10 w-full min-w-0 truncate rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-xs'

const idDe = (e: EmpresaMinera) => e.idEmpresaMinera ?? e.id ?? 0
const nombreDe = (e: EmpresaMinera) => e.nombreUnidadMinera ?? e.nombre ?? 'Unidad minera'
const tieneCoordenadas = (e: EmpresaMinera) => Number.isFinite(e.latitud) && Number.isFinite(e.longitud) && !(e.latitud === 0 && e.longitud === 0)
const idClienteDe = (e: EmpresaMinera) => e.cliente?.idCliente
const idEtapaDe = (e: EmpresaMinera) => e.etapaComercial?.idEtapaComercial
// La lista de minerales por unidad no viene embebida en este listado (es un
// endpoint aparte, /empresas-mineras/{id}/minerales); de momento no se pide
// aquí fila por fila para no disparar N requests al cargar la página.

export function EmpresasMinerasPage() {
  const { data = [], isLoading, isError, refetch } = useEmpresasMineras()

  const [vista, setVista] = useState<'mapa' | 'tabla'>('mapa')
  const [filtroEtapa, setFiltroEtapa] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [seleccion, setSeleccion] = useState<number | null>(null)
  const [altaAbierta, setAltaAbierta] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const nombreCliente = useMemo(() => {
    // El nombre ya viene en cada unidad (cliente.tercero): antes se pedían aparte 500 clientes solo para esto.
    const mapa = new Map(data.map((e) => [idClienteDe(e), e.cliente?.tercero?.nombreComercial || e.cliente?.tercero?.razonSocial]))
    return (id: number | undefined) => (id != null ? mapa.get(id) ?? `Cliente #${id}` : 'Sin cliente')
  }, [data])

  // Etapas presentes en los datos, en el orden del flujo comercial
  const etapas = useMemo(() => {
    const unicas = new Map<number, { id: number; nombre: string; orden: number }>()
    for (const e of data) {
      if (e.etapaComercial) unicas.set(e.etapaComercial.idEtapaComercial, { id: e.etapaComercial.idEtapaComercial, nombre: e.etapaComercial.nombreEtapa, orden: e.etapaComercial.ordenFlujo })
    }
    return [...unicas.values()]
      .sort((a, b) => a.orden - b.orden)
      .map((e) => ({ ...e, color: familiaDe(e.nombre)?.color ?? COLOR_SIN_ETAPA }))
  }, [data])
  const etapaDe = (e: EmpresaMinera) => etapas.find((x) => x.id === idEtapaDe(e))

  const clientesConUnidades = useMemo(() => [...new Set(data.map((e) => idClienteDe(e)).filter((id): id is number => id != null))], [data])

  const filtradas = useMemo(
    () =>
      data.filter(
        (e) =>
          (!filtroEtapa || String(idEtapaDe(e)) === filtroEtapa) &&
          (!filtroCliente || String(idClienteDe(e)) === filtroCliente) &&
          (!busqueda || `${nombreDe(e)} ${nombreCliente(idClienteDe(e))} ${e.cliente?.tercero?.numeroDocumento ?? ""}`.toLowerCase().includes(busqueda.toLowerCase()))
      ),
    [data, filtroEtapa, filtroCliente, busqueda, nombreCliente]
  )

  const puntos: PuntoMapa[] = useMemo(
    () =>
      filtradas.filter(tieneCoordenadas).map((e) => ({
        id: idDe(e),
        nombre: nombreDe(e),
        lat: e.latitud,
        lon: e.longitud,
        color: etapas.find((x) => x.id === idEtapaDe(e))?.color ?? COLOR_SIN_ETAPA,
      })),
    [filtradas, etapas]
  )

  const actual = filtradas.find((e) => idDe(e) === seleccion) ?? filtradas[0]
  const sinCoordenadas = filtradas.length - puntos.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Empresas mineras</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="tabular-nums">{data.length}</span> unidades mineras de{' '}
            <span className="tabular-nums">{clientesConUnidades.length}</span> clientes
          </p>
        </div>
        <div className="flex items-center gap-3"><button type="button" onClick={() => setAltaAbierta(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-white shadow-sm hover:opacity-90"><Plus className="h-4 w-4"/>Nueva unidad</button><div role="group" aria-label="Vista" className="flex gap-0.5 rounded-lg border border-border bg-card p-0.5">
          {(['mapa', 'tabla'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={cn(
                'h-8 rounded-md px-3 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                vista === v ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div></div></div>

      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-md"><span className="sr-only">Buscar cliente, RUC o unidad minera</span><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente, RUC o unidad minera" className={`${selectClass} sm:w-full`} /></label>
        <label className="sr-only" htmlFor="em-etapa">Etapa comercial</label>
        <select id="em-etapa" value={filtroEtapa} onChange={(e) => setFiltroEtapa(e.target.value)} className={selectClass}>
          <option value="">Todas las etapas</option>
          {etapas.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <label className="sr-only" htmlFor="em-cliente">Cliente</label>
        <select id="em-cliente" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} className={selectClass}>
          <option value="">Todos los clientes</option>
          {clientesConUnidades.map((id) => <option key={id} value={id}>{nombreCliente(id)}</option>)}
        </select>
      </div>

      {isError && <ErrorBanner message="No se pudieron cargar las empresas mineras." onRetry={() => refetch()} />}

      {!isLoading && !isError && filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-4 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Building2 className="h-5.5 w-5.5" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold">
            {data.length === 0 ? 'Aún no hay unidades mineras registradas' : 'Ninguna unidad coincide con los filtros'}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {data.length === 0 ? 'Se registran desde la ficha de cada cliente.' : 'Prueba con otra etapa o cliente.'}
          </p>
        </div>
      ) : vista === 'mapa' ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section aria-label="Mapa de unidades mineras" className="rounded-xl border border-border bg-card p-3">
            {isLoading ? (
              <Skeleton variant="rectangular" className="h-130" />
            ) : (
              <MapaUnidades puntos={puntos} seleccionado={actual ? idDe(actual) : null} onSeleccionar={setSeleccion} className="h-130" />
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
              {etapas.map((e) => (
                <span key={e.id} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} aria-hidden="true" />
                  {e.nombre}
                </span>
              ))}
              {sinCoordenadas > 0 && <span className="ml-auto">{sinCoordenadas} sin coordenadas (no aparecen en el mapa)</span>}
            </div>
          </section>

          <div className="flex min-w-0 flex-col gap-4">
            {actual && (
              <section aria-labelledby="ficha-t" className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id="ficha-t" className="text-lg font-semibold">{nombreDe(actual)}</h2>
                    <p className="text-[13px] text-muted-foreground">{actual.tipoOperacion?.nombreOperacion ?? 'Unidad minera'}</p>
                  </div>
                  {etapaDe(actual) && <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${clasesDeEtapa(etapaDe(actual)!.nombre) ?? "bg-slate-100 text-slate-700"}`}>{etapaDe(actual)!.nombre}</span>}
                </div>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd>
                    {idClienteDe(actual) != null ? (
                      <Link to={`/clientes/${idClienteDe(actual)}`} className="rounded text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {nombreCliente(idClienteDe(actual))}
                      </Link>
                    ) : '—'}
                  </dd>
                  <dt className="text-muted-foreground">Coordenadas</dt>
                  <dd className="tabular-nums">{tieneCoordenadas(actual) ? `${actual.latitud.toFixed(4)}, ${actual.longitud.toFixed(4)}` : 'Sin coordenadas'}</dd>
                  {actual.altitudMsnm != null && (
                    <>
                      <dt className="text-muted-foreground">Altitud</dt>
                      <dd className="tabular-nums">{actual.altitudMsnm.toLocaleString('es-PE')} m s. n. m.</dd>
                    </>
                  )}
                  {actual.capacidadProduccion && (
                    <>
                      <dt className="text-muted-foreground">Capacidad</dt>
                      <dd>{actual.capacidadProduccion}</dd>
                    </>
                  )}
                </dl>
                {actual.descripcion && <p className="mt-3 text-sm text-muted-foreground">{actual.descripcion}</p>}
              </section>
            )}

            <section aria-label="Lista de unidades mineras" className="rounded-xl border border-border bg-card p-2">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : (
                <ul className="max-h-90 overflow-y-auto">
                  {filtradas.map((e) => {
                    const activa = actual && idDe(e) === idDe(actual)
                    return (
                      <li key={idDe(e)}>
                        <button
                          type="button"
                          aria-pressed={!!activa}
                          onClick={() => setSeleccion(idDe(e))}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                            activa ? 'bg-accent/10' : 'hover:bg-muted'
                          )}
                        >
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: etapaDe(e)?.color ?? COLOR_SIN_ETAPA }} aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{nombreDe(e)}</span>
                            <span className="block truncate text-xs text-muted-foreground">{nombreCliente(idClienteDe(e))}</span>
                          </span>
                          {!tieneCoordenadas(e) && <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Sin coordenadas" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <caption className="sr-only">Unidades mineras</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Unidad minera</th>
                  <th className="px-4 py-2.5 font-medium">Cliente</th>
                  <th className="px-4 py-2.5 font-medium">Etapa</th>
                  <th className="px-4 py-2.5 font-medium">Coordenadas</th>
                  <th className="px-4 py-2.5 text-right font-medium">Altitud</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeletonRows columns={5} />
                ) : (
                  filtradas.map((e) => (
                    <tr key={idDe(e)} className="border-t border-border first:border-t-0 hover:bg-muted/60">
                      <td className="px-4 py-3">
                        <p className="font-medium">{nombreDe(e)}</p>
                        <p className="text-xs text-muted-foreground">{e.tipoOperacion?.nombreOperacion ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">{nombreCliente(idClienteDe(e))}</td>
                      <td className="px-4 py-3">{etapaDe(e) ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${clasesDeEtapa(etapaDe(e)!.nombre) ?? "bg-slate-100 text-slate-700"}`}>{etapaDe(e)!.nombre}</span> : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">{tieneCoordenadas(e) ? `${e.latitud.toFixed(4)}, ${e.longitud.toFixed(4)}` : 'Sin coordenadas'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{e.altitudMsnm != null ? `${e.altitudMsnm.toLocaleString('es-PE')} m` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {altaAbierta && <CrearUnidadMineraDialog onClose={() => setAltaAbierta(false)} />}
    </div>
  )
}







