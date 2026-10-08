import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as productosApi from "@/api/productosApi"
import { productosKeys } from "./useProductos"
import type {
  MediosNuevosProducto,
  Producto,
  ProductoRequest,
} from "@/types/producto.types"

export interface GuardarProductoInput {
  values: ProductoRequest
  /** Archivos ya subidos a Cloudinary que se asociarán al producto. */
  medios: MediosNuevosProducto
}

export interface GuardarProductoResultado {
  producto: Producto
  /** Cantidad de imágenes/documentos que no se pudieron asociar. */
  mediosFallidos: number
}

/**
 * Asocia imágenes y documentos al producto de a uno (para conservar el orden).
 * Un fallo no aborta el resto: se cuenta y se informa al usuario.
 */
async function adjuntarMedios(idProducto: number, medios: MediosNuevosProducto): Promise<number> {
  let fallidos = 0

  for (const imagen of medios.imagenes) {
    try {
      await productosApi.agregarImagenProducto(idProducto, imagen)
    } catch {
      fallidos += 1
    }
  }

  for (const documento of medios.documentos) {
    try {
      await productosApi.agregarDocumentoProducto(idProducto, documento)
    } catch {
      fallidos += 1
    }
  }

  return fallidos
}

/** Crea el producto y luego le asocia sus imágenes y documentos. */
export function useCrearProducto() {
  const queryClient = useQueryClient()

  return useMutation<GuardarProductoResultado, unknown, GuardarProductoInput>({
    mutationFn: async ({ values, medios }) => {
      const producto = await productosApi.crearProducto(values)
      const mediosFallidos = await adjuntarMedios(producto.idProducto, medios)
      return { producto, mediosFallidos }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productosKeys.all }),
  })
}

/** Actualiza el producto y asocia los medios nuevos que se hayan subido en la edición. */
export function useActualizarProducto(idProducto: number) {
  const queryClient = useQueryClient()

  return useMutation<GuardarProductoResultado, unknown, GuardarProductoInput>({
    mutationFn: async ({ values, medios }) => {
      const producto = await productosApi.actualizarProducto(idProducto, values)
      const mediosFallidos = await adjuntarMedios(idProducto, medios)
      return { producto, mediosFallidos }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productosKeys.all }),
  })
}
