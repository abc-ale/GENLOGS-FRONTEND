import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react"
import { mensajeErrorApi } from "@/api/productosApi"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEliminarProducto, useProducto } from "@/hooks/useProductos"
import { ProductoDetalle } from "../components/ProductoDetalle"

function DetalleSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2" aria-busy="true" aria-label="Cargando producto">
      <Skeleton variant="rectangular" className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

export function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const idProducto = Number(id)
  const navigate = useNavigate()
  const idInvalido = !Number.isInteger(idProducto) || idProducto <= 0
  const { data: producto, isLoading, isError, refetch } = useProducto(idProducto)
  const eliminar = useEliminarProducto()
  const hayError = isError || idInvalido

  function handleEliminar() {
    if (!producto) return
    const confirmado = window.confirm(
      `¿Eliminar «${producto.nombreProducto}»? Esta acción no se puede deshacer.`
    )
    if (!confirmado) return
    eliminar.mutate(producto.idProducto, {
      onSuccess: () => navigate("/catalogo-repuestos", { replace: true }),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        to="/catalogo-repuestos"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al catálogo
      </Link>

      {isLoading && <DetalleSkeleton />}

      {hayError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span className="text-destructive">
            No se encontró el producto o no se pudo cargar.
          </span>
          {!idInvalido && (
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          )}
        </div>
      )}

      {producto && (
        <>
          <ProductoDetalle
            producto={producto}
            acciones={
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/catalogo-repuestos/${producto.idProducto}/editar`}>
                    <Pencil className="mr-1 h-4 w-4" aria-hidden="true" />
                    Editar
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="text-white"
                  onClick={handleEliminar}
                  disabled={eliminar.isPending}
                >
                  {eliminar.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                  )}
                  Eliminar
                </Button>
              </>
            }
          />
          {eliminar.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mensajeErrorApi(
                eliminar.error,
                "No se pudo eliminar el producto. Puede estar en uso en cotizaciones u otros registros."
              )}
            </p>
          )}
        </>
      )}
    </div>
  )
}
