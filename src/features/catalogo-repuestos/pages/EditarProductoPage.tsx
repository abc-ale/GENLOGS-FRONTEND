import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { mensajeErrorApi } from "@/api/productosApi"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useActualizarProducto } from "@/hooks/useCrearProducto"
import { useProducto } from "@/hooks/useProductos"
import { productoFormToRequest, productoToFormValues } from "@/lib/validators/producto.schema"
import type { ProductoFormValues } from "@/lib/validators/producto.schema"
import type { MediosNuevosProducto } from "@/types/producto.types"
import { ProductoForm } from "../components/ProductoForm"

export function EditarProductoPage() {
  const { id } = useParams<{ id: string }>()
  const idProducto = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const aviso = (location.state as { aviso?: string } | null)?.aviso

  const idInvalido = !Number.isInteger(idProducto) || idProducto <= 0
  const { data: producto, isLoading, isError, refetch } = useProducto(idProducto)
  const { mutate, isPending, error } = useActualizarProducto(idProducto)
  const hayError = isError || idInvalido

  function handleSubmit(values: ProductoFormValues, medios: MediosNuevosProducto) {
    mutate(
      { values: productoFormToRequest(values), medios },
      {
        onSuccess: ({ mediosFallidos }) => {
          if (mediosFallidos > 0) {
            navigate(location.pathname, {
              replace: true,
              state: {
                aviso:
                  mediosFallidos === 1
                    ? "Los cambios se guardaron, pero 1 archivo no se pudo asociar. Vuelve a subirlo."
                    : `Los cambios se guardaron, pero ${mediosFallidos} archivos no se pudieron asociar. Vuelve a subirlos.`,
              },
            })
            return
          }
          navigate(`/catalogo-repuestos/${idProducto}`)
        },
      }
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          to={`/catalogo-repuestos/${idProducto}`}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al producto
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Editar producto</h1>
      </div>

      {aviso && (
        <p role="status" className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          {aviso}
        </p>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando producto">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {hayError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span className="text-destructive">No se encontró el producto o no se pudo cargar.</span>
          {!idInvalido && (
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          )}
        </div>
      )}

      {producto && (
        <ProductoForm
          key={`${producto.idProducto}-${producto.imagenes.length}-${producto.documentos.length}`}
          defaultValues={productoToFormValues(producto)}
          imagenesExistentes={producto.imagenes}
          documentosExistentes={producto.documentos}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/catalogo-repuestos/${idProducto}`)}
          submitting={isPending}
          submitLabel="Guardar cambios"
          errorMessage={
            error ? mensajeErrorApi(error, "No se pudieron guardar los cambios. Revisa los datos e intenta de nuevo.") : null
          }
        />
      )}
    </div>
  )
}
