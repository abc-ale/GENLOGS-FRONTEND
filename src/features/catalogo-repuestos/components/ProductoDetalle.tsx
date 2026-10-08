import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { FileText, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { ETIQUETA_TIPO_DOCUMENTO } from "@/types/producto.types"
import type { CaracteristicaProducto, Producto } from "@/types/producto.types"

interface ProductoDetalleProps {
  producto: Producto
  /** Botones de acción (editar, eliminar…) que se muestran junto al título. */
  acciones?: ReactNode
}

/** Características que se destacan arriba de la ficha (comparadas sin tildes ni mayúsculas). */
const DESTACADAS: Array<{ clave: string; titulo: string }> = [
  { clave: "material", titulo: "Material" },
  { clave: "aplicacion", titulo: "Aplicación" },
  { clave: "tiempo de entrega", titulo: "Tiempo de entrega" },
]

function normalizar(texto?: string): string {
  if (!texto) return ""
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function formatearValor(c: CaracteristicaProducto): string {
  return c.unidadCaracteristica ? `${c.valorCaracteristica} ${c.unidadCaracteristica}` : c.valorCaracteristica
}

export function ProductoDetalle({ producto, acciones }: ProductoDetalleProps) {
  const [seleccion, setSeleccion] = useState(0)

  // La imagen principal va primero en la galería.
  const imagenes = useMemo(
    () =>
      [...(producto.imagenes ?? [])].sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal)),
    [producto.imagenes]
  )
  const imagenActual = imagenes[Math.min(seleccion, Math.max(imagenes.length - 1, 0))]

  const { destacadas, otras } = useMemo(() => {
    const claves = new Set(DESTACADAS.map((d) => d.clave))
    const todas = producto.caracteristicas ?? []
    return {
      destacadas: DESTACADAS.map((d) => ({
        titulo: d.titulo,
        caracteristica: todas.find((c) => normalizar(c.nombreCaracteristica) === d.clave),
      })).filter((d) => d.caracteristica !== undefined),
      otras: todas.filter((c) => !claves.has(normalizar(c.nombreCaracteristica))),
    }
  }, [producto.caracteristicas])

  const documentos = producto.documentos ?? []
  const hayFilasTabla = otras.length > 0 || !!producto.procedencia

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Galería */}
      <div className="flex flex-col gap-3">
        <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
          {imagenActual ? (
            <img
              src={imagenActual.urlImagen}
              alt={producto.nombreProducto}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <span className="text-sm">Este producto aún no tiene imágenes</span>
            </div>
          )}
        </div>

        {imagenes.length > 1 && (
          <ul className="flex flex-wrap gap-2" aria-label="Galería de imágenes">
            {imagenes.map((img, index) => (
              <li key={img.idProductoImagen}>
                <button
                  type="button"
                  onClick={() => setSeleccion(index)}
                  aria-label={`Ver imagen ${index + 1} de ${imagenes.length}`}
                  aria-current={imagenActual?.idProductoImagen === img.idProductoImagen}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    imagenActual?.idProductoImagen === img.idProductoImagen
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img.urlImagen} alt="" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Información */}
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{producto.codigoProducto}</p>
              <h1 className="text-2xl font-semibold leading-tight">{producto.nombreProducto}</h1>
            </div>
            {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {producto.marcaNombre && (
              <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
                {producto.marcaNombre}
              </span>
            )}
            {producto.categoriaNombre && (
              <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                {producto.categoriaNombre}
              </span>
            )}
            {!producto.visibleWeb && (
              <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                Oculto en el catálogo web
              </span>
            )}
            {producto.status === "I" && (
              <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">Inactivo</span>
            )}
          </div>
        </header>

        {destacadas.length > 0 && (
          <dl className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-3">
            {destacadas.map(({ titulo, caracteristica }) => (
              <div key={titulo} className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">{titulo}</dt>
                <dd className="text-sm font-medium">{caracteristica ? formatearValor(caracteristica) : ""}</dd>
              </div>
            ))}
          </dl>
        )}

        {producto.descripcion && (
          <section aria-labelledby="detalle-descripcion" className="flex flex-col gap-2">
            <h2 id="detalle-descripcion" className="text-base font-semibold">
              Descripción
            </h2>
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed">{producto.descripcion}</p>
          </section>
        )}

        <section aria-labelledby="detalle-ficha" className="flex flex-col gap-2">
          <h2 id="detalle-ficha" className="text-base font-semibold">
            Ficha técnica
          </h2>
          {hayFilasTabla ? (
            <table className="w-full text-sm">
              <tbody>
                {otras.map((c) => (
                  <tr key={c.idCaracteristica} className="border-b border-border">
                    <th scope="row" className="w-2/5 py-2 pr-4 text-left font-normal text-muted-foreground">
                      {c.nombreCaracteristica}
                    </th>
                    <td className="py-2 font-medium">{formatearValor(c)}</td>
                  </tr>
                ))}
                {producto.procedencia && (
                  <tr className="border-b border-border">
                    <th scope="row" className="w-2/5 py-2 pr-4 text-left font-normal text-muted-foreground">
                      Procedencia
                    </th>
                    <td className="py-2 font-medium">{producto.procedencia}</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">
              {destacadas.length > 0
                ? "No hay más características registradas."
                : "Este producto aún no tiene características técnicas registradas."}
            </p>
          )}
        </section>

        <section aria-labelledby="detalle-documentos" className="flex flex-col gap-2">
          <h2 id="detalle-documentos" className="text-base font-semibold">
            Documentos
          </h2>
          {documentos.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {documentos.map((doc) => (
                <li key={doc.idDocumento}>
                  <a
                    href={doc.urlDocumento}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-medium">{doc.nombreDocumento}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {ETIQUETA_TIPO_DOCUMENTO[doc.tipoDocumento] ?? doc.tipoDocumento}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No hay fichas, manuales ni certificados cargados.</p>
          )}
        </section>
      </div>
    </article>
  )
}
