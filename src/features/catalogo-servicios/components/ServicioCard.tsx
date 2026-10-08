import { Skeleton } from "@/components/ui/skeleton"
import type { Servicio } from "@/types/servicio.types"

interface ServicioCardProps {
  servicio: Servicio
  onEditar?: (servicio: Servicio) => void
  onDesactivar?: (servicio: Servicio) => void
}

export function ServicioCard({ servicio, onEditar, onDesactivar }: ServicioCardProps) {
  const inactivo = servicio.status === "I"

  return (
    <div className={`flex flex-col gap-2 rounded-lg border border-border p-4 ${inactivo ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{servicio.codigoServicio}</p>
          <h3 className="text-base font-semibold">{servicio.nombreServicio}</h3>
        </div>
        {inactivo && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Inactivo</span>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{servicio.descripcion}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span><strong>Categoría:</strong> {servicio.categoriaServicio?.nombreCategoria}</span>
        <span><strong>Unidad:</strong> {servicio.unidadMedida?.nombreUnidad}</span>
        {servicio.duracionEstimadaHoras != null && (
          <span><strong>Duración:</strong> {servicio.duracionEstimadaHoras} h</span>
        )}
      </div>

      <div className="flex gap-2">
        {servicio.visibleWeb && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Visible en web</span>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        {onEditar && (
          <button
            onClick={() => onEditar(servicio)}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            Editar
          </button>
        )}
        {onDesactivar && !inactivo && (
          <button
            onClick={() => onDesactivar(servicio)}
            className="rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            Desactivar
          </button>
        )}
      </div>
    </div>
  )
}

export function ServicioCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4" aria-hidden="true">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
