import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { FileText, ImageOff, LogIn, Package, Search, X } from "lucide-react"
import { listarCatalogoPublico, type ProductoPublico } from "@/api/catalogoPublicoApi"
import logoGenlogs from "@/assets/GENLOGS.png"

function categoriaDe(p: ProductoPublico): string {
  return p.categoriaNombre || p.categoria || "Sin categoría"
}

function marcaDe(p: ProductoPublico): string | null {
  return p.marcaNombre || p.marca || null
}

function imagenDe(p: ProductoPublico): string | null {
  return p.imagenPrincipal || p.imagenes?.find((i) => i.esPrincipal)?.urlImagen || p.imagenes?.[0]?.urlImagen || null
}

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function Imagen({ producto, className }: { producto: ProductoPublico; className: string }) {
  const url = imagenDe(producto)
  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <ImageOff className="h-8 w-8" aria-hidden="true" />
      </div>
    )
  }
  return <img src={url} alt={producto.nombreProducto} loading="lazy" className={`object-contain bg-white ${className}`} />
}

function DetalleProducto({ producto, onClose }: { producto: ProductoPublico; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const marca = marcaDe(producto)
  const caracteristicas = producto.caracteristicas ?? []
  const documentos = producto.documentos ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-producto-publico"
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-3xl space-y-5 rounded-xl border border-border bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">{categoriaDe(producto)}</p>
            <h2 id="titulo-producto-publico" className="text-xl font-semibold text-foreground">{producto.nombreProducto}</h2>
            <p className="text-sm text-muted-foreground">Código {producto.codigoProducto}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-md p-2 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Imagen producto={producto} className="aspect-square w-full rounded-lg border border-border" />
          <div className="space-y-4 text-sm">
            {producto.descripcion && <p className="text-foreground">{producto.descripcion}</p>}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
              {marca && (<><dt className="text-muted-foreground">Marca</dt><dd>{marca}</dd></>)}
              {producto.procedencia && (<><dt className="text-muted-foreground">Procedencia</dt><dd>{producto.procedencia}</dd></>)}
              {producto.unidadMedida && (<><dt className="text-muted-foreground">Unidad</dt><dd>{producto.unidadMedida}</dd></>)}
            </dl>

            {caracteristicas.length > 0 && (
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Características técnicas</h3>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {caracteristicas.map((c) => (
                    <div key={c.idCaracteristica} className="contents">
                      <dt className="text-muted-foreground">{c.nombreCaracteristica}</dt>
                      <dd>
                        {c.valorCaracteristica ?? c.valor ?? "—"}
                        {c.unidadCaracteristica ? ` ${c.unidadCaracteristica}` : ""}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {documentos.length > 0 && (
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Fichas y documentos</h3>
                <ul className="space-y-1">
                  {documentos.map((d) => (
                    <li key={d.idDocumento}>
                      <a href={d.urlDocumento} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        {d.nombreDocumento}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="rounded-md bg-muted/60 p-3 text-muted-foreground">
              Para precios, plazos y disponibilidad, solicita una cotización a nuestro equipo comercial.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Catálogo público de productos (RF-16, CU-12): muestra, sin iniciar sesión,
 * los productos activos marcados como visibles en la web. No muestra stock ni precios.
 */
export function CatalogoPublicoPage() {
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState("")
  const [seleccionado, setSeleccionado] = useState<ProductoPublico | null>(null)

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["catalogo-publico"],
    queryFn: listarCatalogoPublico,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const categorias = useMemo(
    () => Array.from(new Set(data.map(categoriaDe))).sort((a, b) => a.localeCompare(b, "es")),
    [data],
  )

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim())
    return data.filter((p) => {
      if (categoria && categoriaDe(p) !== categoria) return false
      if (!termino) return true
      return [p.nombreProducto, p.codigoProducto, marcaDe(p) ?? ""].some((t) => normalizar(t).includes(termino))
    })
  }, [data, busqueda, categoria])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logoGenlogs} alt="GENLOGS" className="h-9 w-auto" />
            <span className="hidden text-sm text-muted-foreground sm:inline">Soluciones industriales</span>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Acceso de personal
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Catálogo de productos</h1>
          <p className="text-muted-foreground">
            Bombas, válvulas, automatización, conexiones, soldadura, revestimientos, mangueras y liners.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar por nombre, código o marca</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o marca"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
            />
          </label>
          <label className="sm:w-64">
            <span className="sr-only">Filtrar por categoría</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        {isError && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <span className="text-destructive">No se pudo cargar el catálogo en este momento.</span>
            <button type="button" onClick={() => refetch()} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">
              Reintentar
            </button>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando catálogo">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
            </p>
            {filtrados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                <Package className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
                {data.length === 0 ? "Aún no hay productos publicados." : "No hay productos que coincidan con la búsqueda."}
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtrados.map((p) => (
                  <li key={p.idProducto}>
                    <button
                      type="button"
                      onClick={() => setSeleccionado(p)}
                      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-accent/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Imagen producto={p} className="h-44 w-full" />
                      <div className="flex flex-1 flex-col gap-1 p-4">
                        <span className="text-xs font-medium uppercase tracking-wide text-accent">{categoriaDe(p)}</span>
                        <span className="font-semibold text-foreground">{p.nombreProducto}</span>
                        <span className="text-xs text-muted-foreground">
                          Código {p.codigoProducto}
                          {marcaDe(p) ? ` · ${marcaDe(p)}` : ""}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {seleccionado && <DetalleProducto producto={seleccionado} onClose={() => setSeleccionado(null)} />}
    </div>
  )
}
