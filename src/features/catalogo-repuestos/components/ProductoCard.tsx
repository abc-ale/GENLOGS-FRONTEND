import { ImageOff } from "lucide-react"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/utils"
import type { Producto } from "@/types/producto.types"

export function ProductoCard({ producto }: { producto: Producto }) {
  const imagen =
    producto.imagenes?.find((img) => img.esPrincipal) ?? producto.imagenes?.[0]
  const inactivo = producto.status === "I"

  return (
    <Link
      to={`/catalogo-repuestos/${producto.idProducto}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        inactivo && "opacity-60"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imagen ? (
          <img
            src={imagen.urlImagen}
            alt={producto.nombreProducto}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        {(inactivo || !producto.visibleWeb) && (
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {inactivo && (
              <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">Inactivo</span>
            )}
            {!producto.visibleWeb && (
              <span className="rounded-full bg-background/90 px-2 py-0.5 text-xs text-foreground shadow-sm">
                Oculto en web
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs text-muted-foreground">{producto.codigoProducto}</p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{producto.nombreProducto}</h3>
        <p className="text-xs font-medium text-foreground" aria-label={`Stock disponible: ${producto.stock}`}>
          Stock: {producto.stock}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 pt-1 text-xs text-muted-foreground">
          {producto.marcaNombre && <span className="font-medium text-foreground">{producto.marcaNombre}</span>}
          {producto.categoriaNombre && <span className="truncate">{producto.categoriaNombre}</span>}
        </div>
      </div>
    </Link>
  )
}

export function ProductoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      <Skeleton variant="rectangular" className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}
