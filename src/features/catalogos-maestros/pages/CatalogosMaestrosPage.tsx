import { useState } from 'react'
import { Database, Loader2, Pencil, Plus, Power } from 'lucide-react'
import { mensajeErrorApi } from '@/api/productosApi'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeletonRows } from '@/components/ui/TableSkeletonRows'
import { useCatalogoMaestro, useDesactivarCatalogoMaestro } from '../hooks/useCatalogoMaestro'
import { CatalogoMaestroFormModal } from '../components/CatalogoMaestroFormModal'
import {
  CATALOGOS_MAESTROS,
  idPadreDe,
  nuevoDe,
  type CatalogoMaestroDef,
  type RegistroCatalogo,
} from '../catalogosMaestros.config'

function TablaCatalogo({ def }: { def: CatalogoMaestroDef }) {
  const [verInactivos, setVerInactivos] = useState(false)
  const [editando, setEditando] = useState<RegistroCatalogo | null | undefined>(undefined)
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const { data = [], isLoading, isError, refetch } = useCatalogoMaestro(def.recurso, !verInactivos)
  const desactivar = useDesactivarCatalogoMaestro(def.recurso)
  const activos = data.filter((r) => r.status !== 'I')
  const columnas = def.campos.length + 2

  function nombreDe(registro: RegistroCatalogo): string {
    return String(registro[def.campos[0].nombre] ?? '')
  }

  function mostrarValor(registro: RegistroCatalogo, nombreCampo: string): string {
    const campo = def.campos.find((c) => c.nombre === nombreCampo)
    if (campo?.tipo === 'categoriaPadre') {
      const idPadre = idPadreDe(registro)
      if (idPadre == null) return '—'
      const padre = data.find((r) => Number(r[def.idCampo]) === idPadre)
      return padre ? nombreDe(padre) : `#${idPadre}`
    }
    const valor = registro[nombreCampo]
    return valor == null || valor === '' ? '—' : String(valor)
  }

  function handleDesactivar(registro: RegistroCatalogo) {
    const nombre = nombreDe(registro)
    if (!window.confirm(`¿Desactivar ${def.singular} «${nombre}»? Dejará de aparecer en los formularios; los documentos existentes no cambian.`)) return
    setMensaje(null)
    desactivar.mutate(Number(registro[def.idCampo]), {
      onSuccess: () => setMensaje({ ok: true, texto: `«${nombre}» quedó inactivo.` }),
      onError: (e) => setMensaje({ ok: false, texto: mensajeErrorApi(e, 'No se pudo desactivar el registro.') }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{def.descripcion}</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={verInactivos}
              onChange={(e) => setVerInactivos(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Mostrar inactivos
          </label>
          <button
            type="button"
            onClick={() => {
              setMensaje(null)
              setEditando(null)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#203f68] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#203f68]/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {nuevoDe(def)}
          </button>
        </div>
      </div>

      {mensaje && (
        <p
          role={mensaje.ok ? 'status' : 'alert'}
          className={`rounded-lg border px-4 py-3 text-sm ${mensaje.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-destructive/40 bg-destructive/5 text-destructive'}`}
        >
          {mensaje.texto}
        </p>
      )}

      {isError && <ErrorBanner message={`No se pudo cargar ${def.titulo.toLowerCase()}.`} onRetry={() => refetch()} />}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                {def.campos.map((c) => (
                  <th key={c.nombre} className="p-3 font-medium text-muted-foreground">{c.etiqueta}</th>
                ))}
                <th className="p-3 font-medium text-muted-foreground">Estado</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeletonRows columns={columnas} />}
              {!isLoading && !isError && data.length === 0 && (
                <tr>
                  <td colSpan={columnas} className="p-10 text-center text-muted-foreground">
                    No hay registros.
                  </td>
                </tr>
              )}
              {data.map((registro) => {
                const inactivo = registro.status === 'I'
                const nombre = nombreDe(registro)
                return (
                  <tr key={String(registro[def.idCampo])} className="border-t border-border hover:bg-muted/50">
                    {def.campos.map((c) => (
                      <td key={c.nombre} className={`p-3 ${inactivo ? 'text-muted-foreground' : ''}`}>
                        {mostrarValor(registro, c.nombre)}
                      </td>
                    ))}
                    <td className="p-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${inactivo ? 'border-border bg-muted text-muted-foreground' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {inactivo ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td className="p-3">
                      {!inactivo && (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setMensaje(null)
                              setEditando(registro)
                            }}
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Editar ${nombre}`}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDesactivar(registro)}
                            disabled={desactivar.isPending}
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50"
                            aria-label={`Desactivar ${nombre}`}
                            title="Desactivar"
                          >
                            {desactivar.isPending && desactivar.variables === Number(registro[def.idCampo]) ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Power className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editando !== undefined && (
        <CatalogoMaestroFormModal
          def={def}
          registro={editando}
          registros={activos}
          onClose={() => setEditando(undefined)}
          onGuardado={(texto) => setMensaje({ ok: true, texto })}
        />
      )}
    </div>
  )
}

/** Mantenimiento de los catálogos maestros del sistema (RF-20, CU-14). */
export function CatalogosMaestrosPage() {
  const [clave, setClave] = useState(CATALOGOS_MAESTROS[0].clave)
  const actual = CATALOGOS_MAESTROS.find((c) => c.clave === clave) ?? CATALOGOS_MAESTROS[0]

  return (
    <section className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Database className="h-6 w-6 text-accent" aria-hidden="true" />
          Catálogos maestros
        </h1>
        <p className="text-sm text-muted-foreground">
          Tablas de apoyo que usan los formularios del sistema. La baja es lógica: un registro inactivo
          deja de ofrecerse, pero los documentos que ya lo usan se conservan.
        </p>
      </header>

      <div role="tablist" aria-label="Catálogos maestros" className="flex gap-2 overflow-x-auto pb-1">
        {CATALOGOS_MAESTROS.map((c) => {
          const activo = c.clave === actual.clave
          return (
            <button
              key={c.clave}
              type="button"
              role="tab"
              id={`tab-${c.clave}`}
              aria-selected={activo}
              aria-controls={`panel-${c.clave}`}
              onClick={() => setClave(c.clave)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activo
                  ? 'border-[#203f68] bg-[#203f68] text-white shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-[#203f68]/40 hover:bg-muted'
              }`}
            >
              {c.titulo}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${actual.clave}`} aria-labelledby={`tab-${actual.clave}`}>
        {/* key: al cambiar de pestaña se reinician filtros, mensajes y formulario. */}
        <TablaCatalogo key={actual.clave} def={actual} />
      </div>
    </section>
  )
}
