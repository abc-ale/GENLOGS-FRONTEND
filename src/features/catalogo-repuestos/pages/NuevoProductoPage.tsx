import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { mensajeErrorApi } from "@/api/productosApi"
import { useCrearProducto } from "@/hooks/useCrearProducto"
import { productoFormToRequest } from "@/lib/validators/producto.schema"
import type { ProductoFormValues } from "@/lib/validators/producto.schema"
import type { MediosNuevosProducto } from "@/types/producto.types"
import { ProductoForm } from "../components/ProductoForm"

export function NuevoProductoPage() {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useCrearProducto()

  function handleSubmit(values: ProductoFormValues, medios: MediosNuevosProducto) {
    mutate(
      { values: productoFormToRequest(values), medios },
      {
        onSuccess: ({ producto, mediosFallidos }) => {
          if (mediosFallidos > 0) {
            // El producto ya existe: se lleva al usuario a editarlo para reintentar los archivos.
            navigate(`/catalogo-repuestos/${producto.idProducto}/editar`, {
              state: {
                aviso:
                  mediosFallidos === 1
                    ? "El producto se creó, pero 1 archivo no se pudo asociar. Vuelve a subirlo."
                    : `El producto se creó, pero ${mediosFallidos} archivos no se pudieron asociar. Vuelve a subirlos.`,
              },
            })
            return
          }
          navigate(`/catalogo-repuestos/${producto.idProducto}`)
        },
      }
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/catalogo-repuestos"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al catálogo
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo producto</h1>
      </div>

      <ProductoForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/catalogo-repuestos")}
        submitting={isPending}
        submitLabel="Crear producto"
        errorMessage={
          error ? mensajeErrorApi(error, "No se pudo crear el producto. Revisa los datos e intenta de nuevo.") : null
        }
      />
    </div>
  )
}
