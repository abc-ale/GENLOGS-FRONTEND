import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/utils"
import type { Producto } from "@/types/producto.types"

export function ProductoCard({ producto }: { producto: Producto }) {
  const inactivo = producto.status === "I"

  return (
    <Link
      to={`/catalogo-repuestos/${producto.idProducto}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-shadow",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        inactivo && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
          {producto.codigoProducto}
        </span>
        {inactivo && (
          <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">Inactivo</span>
        )}
        {!producto.visibleWeb && (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            Oculto en web
          </span>
        )}
      </div>

      <h3 className="line-clamp-2 text-sm font-medium leading-snug">{producto.nombreProducto}</h3>

      <p className="text-xs font-medium text-foreground" aria-label={`Stock disponible: ${producto.stock}`}>
        Stock: {producto.stock}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-2 pt-1 text-xs text-muted-foreground">
        {producto.marcaNombre && <span className="font-medium text-foreground">{producto.marcaNombre}</span>}
        {producto.categoriaNombre && <span className="truncate">{producto.categoriaNombre}</span>}
      </div>
    </Link>
  )
}

export function ProductoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}