import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Package, Plus, Search } from "lucide-react"
import { listarMarcas } from "@/api/marcasApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { useProductos } from "@/hooks/useProductos"
import { cn } from "@/lib/utils/utils"
import type { ProductoFiltros } from "@/types/producto.types"
import { CategoriaSelector } from "../components/CategoriaSelector"
import { ProductoCard, ProductoCardSkeleton } from "../components/ProductoCard"

const TAMANIO_PAGINA = 12

const selectClass =
  "h-10 rounded-lg border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function CatalogoProductosPage() {
  const [texto, setTexto] = useState("")
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined)
  const [idMarca, setIdMarca] = useState<number | undefined>(undefined)
  const [textoDebounced] = useDebounce(texto.trim(), 400)

  // La página se resetea sola cuando cambia cualquier filtro, sin efectos.
  const claveFiltros = JSON.stringify([textoDebounced, idCategoria, idMarca])
  const [paginaActual, setPaginaActual] = useState({ clave: claveFiltros, pagina: 0 })
  const pagina = paginaActual.clave === claveFiltros ? paginaActual.pagina : 0

  const { data: marcas } = useQuery({ queryKey: ["marcas"], queryFn: listarMarcas, staleTime: 5 * 60_000 })

  const filtros: ProductoFiltros = {
    codigo: textoDebounced || undefined,
    idCategoriaProducto: idCategoria,
    idMarca,
    page: pagina,
    size: TAMANIO_PAGINA,
  }

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useProductos(filtros)

  const hayFiltros = texto.trim() !== "" || idCategoria !== undefined || idMarca !== undefined
  const productos = data?.content ?? []
  const totalPaginas = data?.totalPages ?? 0
  const totalElementos = data?.totalElements ?? 0
  const sinResultados = !isLoading && !isError && productos.length === 0

  function irAPagina(nueva: number) {
    setPaginaActual({ clave: claveFiltros, pagina: nueva })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function limpiarFiltros() {
    setTexto("")
    setIdCategoria(undefined)
    setIdMarca(undefined)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Catálogo de repuestos</h1>
          {data && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {totalElementos === 1 ? "1 producto" : `${totalElementos} productos`}
            </p>
          )}
        </div>
        <Button asChild>
          <Link to="/catalogo-repuestos/nuevo">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
        role="search"
      >
        <div className="flex min-w-72 flex-1 items-center gap-2 sm:max-w-xl">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por código del producto"
              aria-label="Código del producto"
              className="pl-9"
            />
          </div>
        </div>

        <CategoriaSelector
          value={idCategoria}
          onChange={setIdCategoria}
          permitirVacio
          className="w-56"
        />

        <select
          aria-label="Filtrar por marca"
          value={idMarca ?? ""}
          onChange={(e) => setIdMarca(e.target.value ? Number(e.target.value) : undefined)}
          className={cn(selectClass, "w-48")}
        >
          <option value="">Todas las marcas</option>
          {marcas?.map((m) => (
            <option key={m.idMarca} value={m.idMarca}>
              {m.nombreMarca}
            </option>
          ))}
        </select>

        {hayFiltros && (
          <Button type="button" variant="ghost" size="sm" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {isError && <ErrorBanner message="No se pudo cargar el catálogo." onRetry={() => refetch()} />}

      {sinResultados && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-accent/15 via-accent/5 to-transparent" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card text-accent shadow-sm ring-1 ring-border/60">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            {hayFiltros
              ? "Ningún producto coincide con los filtros. Prueba con otros criterios."
              : "Aún no hay productos en el catálogo."}
          </p>
          {hayFiltros ? (
            <Button type="button" variant="outline" size="sm" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/catalogo-repuestos/nuevo">Crear el primer producto</Link>
            </Button>
          )}
        </div>
      )}

      <div
        aria-busy={isFetching}
        className={cn(
          "grid grid-cols-2 gap-4 transition-opacity md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
          isPlaceholderData && "opacity-60"
        )}
      >
        {isLoading && Array.from({ length: TAMANIO_PAGINA }).map((_, i) => <ProductoCardSkeleton key={i} />)}
        {productos.map((producto) => (
          <ProductoCard key={producto.idProducto} producto={producto} />
        ))}
      </div>

      {totalPaginas > 1 && (
        <nav aria-label="Paginación del catálogo" className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => irAPagina(pagina - 1)}
            disabled={pagina === 0 || isFetching}
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => irAPagina(pagina + 1)}
            disabled={pagina + 1 >= totalPaginas || isFetching}
          >
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  )
}