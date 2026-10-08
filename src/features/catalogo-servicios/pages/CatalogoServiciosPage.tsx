import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Wrench } from "lucide-react"
import { listarCategoriasServicio } from "@/api/categoriasServicioApi"
import { useServicios, useCrearServicio, useActualizarServicio, useDesactivarServicio } from "../hooks/useServicios"
import { ServicioForm } from "../components/ServicioForm"
import { ServicioCard, ServicioCardSkeleton } from "../components/ServicioCard"
import { CategoriaServicioSelector } from "../components/CategoriaServicioSelector"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import type { Servicio, ServicioFormValues } from "@/types/servicio.types"

export function CatalogoServiciosPage() {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null)
  const [servicioADesactivar, setServicioADesactivar] = useState<Servicio | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined)
  const [mostrarInactivos, setMostrarInactivos] = useState(false)

  const { data: categorias, isLoading: cargandoCategorias } = useQuery({
    queryKey: ["categorias-servicio"],
    queryFn: listarCategoriasServicio,
  })
  const { data: servicios, isLoading, isError } = useServicios(idCategoria, !mostrarInactivos)
  const crear = useCrearServicio()
  const actualizar = useActualizarServicio(servicioEditando?.idServicio ?? 0)
  const desactivar = useDesactivarServicio()

  // La búsqueda por texto se resuelve en el cliente: el endpoint solo filtra por categoría y estado.
  const serviciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return servicios ?? []
    return (servicios ?? []).filter(
      (s) =>
        s.nombreServicio.toLowerCase().includes(termino) ||
        s.codigoServicio.toLowerCase().includes(termino)
    )
  }, [servicios, busqueda])

  function handleNuevo() {
    setServicioEditando(null)
    setMostrarForm(true)
  }

  function handleEditar(servicio: Servicio) {
    setServicioEditando(servicio)
    setMostrarForm(true)
  }

  function handleDesactivar(servicio: Servicio) {
    setServicioADesactivar(servicio)
  }

  function confirmarDesactivar() {
    if (!servicioADesactivar) return
    desactivar.mutate(servicioADesactivar.idServicio, {
      onSuccess: () => setServicioADesactivar(null),
    })
  }

  function handleSubmit(valores: ServicioFormValues) {
    if (servicioEditando) {
      actualizar.mutate(valores, {
        onSuccess: () => setMostrarForm(false),
      })
    } else {
      crear.mutate(valores, {
        onSuccess: () => setMostrarForm(false),
      })
    }
  }

  const hayFiltros = busqueda.trim() !== "" || idCategoria !== undefined

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Catálogo de servicios</h1>
          <p className="text-sm text-muted-foreground">Define los servicios y su duración estimada.</p>
        </div>
        <button
          onClick={handleNuevo}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          + Nuevo servicio
        </button>
      </div>

      {mostrarForm && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {servicioEditando ? "Editar servicio" : "Nuevo servicio"}
            </h2>
            <button onClick={() => setMostrarForm(false)} className="text-sm text-muted-foreground hover:text-foreground">
              Cancelar
            </button>
          </div>
          <ServicioForm
            key={servicioEditando?.idServicio ?? "nuevo"}
            valoresIniciales={
              servicioEditando
                ? {
                    idCategoriaServicio: servicioEditando.categoriaServicio?.idCategoriaServicio,
                    idUnidadMedida: servicioEditando.unidadMedida?.idUnidadMedida,
                    codigoServicio: servicioEditando.codigoServicio,
                    nombreServicio: servicioEditando.nombreServicio,
                    duracionEstimadaHoras: servicioEditando.duracionEstimadaHoras,
                    visibleWeb: servicioEditando.visibleWeb,
                    descripcion: servicioEditando.descripcion,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            enviando={crear.isPending || actualizar.isPending}
          />
          {(crear.isError || actualizar.isError) && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              No se pudo guardar el servicio. Revisa los datos e intenta de nuevo.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código"
          className="min-w-64 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <CategoriaServicioSelector
          categorias={categorias}
          isLoading={cargandoCategorias}
          value={idCategoria}
          onChange={(id) => setIdCategoria(id || undefined)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          Incluir inactivos
        </label>
        {hayFiltros && (
          <button
            onClick={() => {
              setBusqueda("")
              setIdCategoria(undefined)
            }}
            className="text-sm text-muted-foreground underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {isError && <ErrorBanner message="No se pudo cargar el catálogo." />}

      {!isLoading && !isError && serviciosFiltrados.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card text-accent shadow-sm ring-1 ring-border/60">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            {hayFiltros
              ? "Ningún servicio coincide con los filtros. Prueba con otros criterios."
              : "Aún no hay servicios registrados. Crea el primero con «Nuevo servicio»."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <ServicioCardSkeleton key={i} />)}
        {serviciosFiltrados.map((servicio) => (
          <ServicioCard
            key={servicio.idServicio}
            servicio={servicio}
            onEditar={handleEditar}
            onDesactivar={handleDesactivar}
          />
        ))}
      </div>

      <ConfirmDialog
        open={servicioADesactivar !== null}
        title="Desactivar servicio"
        description={
          servicioADesactivar
            ? `"${servicioADesactivar.nombreServicio}" dejará de mostrarse en el catálogo activo. Podrás volver a activarlo más adelante desde "Incluir inactivos".`
            : ""
        }
        confirmLabel="Desactivar"
        variant="destructive"
        isLoading={desactivar.isPending}
        onConfirm={confirmarDesactivar}
        onCancel={() => setServicioADesactivar(null)}
      />
    </div>
  )
}
