import { z } from "zod"
import type { Producto, ProductoRequest } from "@/types/producto.types"

export const caracteristicaSchema = z.object({
  nombreCaracteristica: z
    .string()
    .trim()
    .min(1, "Escribe el nombre (ej. Material)")
    .max(100, "Máximo 100 caracteres"),
  valorCaracteristica: z
    .string()
    .trim()
    .min(1, "Escribe el valor")
    .max(255, "Máximo 255 caracteres"),
  unidadCaracteristica: z.string().trim().max(30, "Máximo 30 caracteres").optional(),
})

function normalizar(texto?: string): string {
  if (!texto) return ""
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export const productoSchema = z.object({
  idCategoriaProducto: z.number({ error: "Selecciona una categoría" }).int().positive("Selecciona una categoría"),
  idMarca: z.number().int().positive().nullish(),
  idUnidadMedida: z
    .number({ error: "Selecciona una unidad de medida" })
    .int()
    .positive("Selecciona una unidad de medida"),
  codigoProducto: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(30, "Máximo 30 caracteres"),
  nombreProducto: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "Máximo 200 caracteres"),
  procedencia: z.string().trim().max(100, "Máximo 100 caracteres").optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  visibleWeb: z.boolean(),
  descripcion: z.string().trim().max(2000, "Máximo 2000 caracteres").optional(),
  caracteristicas: z
    .array(caracteristicaSchema)
    .max(50, "Máximo 50 características")
    .superRefine((items, ctx) => {
      const vistos = new Map<string, number>()
      items.forEach((item, index) => {
        const clave = normalizar(item.nombreCaracteristica)
        if (!clave) return
        if (vistos.has(clave)) {
          ctx.addIssue({
            code: "custom",
            message: "Ya agregaste una característica con este nombre",
            path: [index, "nombreCaracteristica"],
          })
        } else {
          vistos.set(clave, index)
        }
      })
    }),
})

export type ProductoFormValues = z.infer<typeof productoSchema>
export type CaracteristicaFormValues = z.infer<typeof caracteristicaSchema>

const vacioAUndefined = (valor?: string) => {
  const limpio = valor?.trim()
  return limpio ? limpio : undefined
}

/** Convierte los valores del formulario en el payload que espera el backend. */
export function productoFormToRequest(values: ProductoFormValues): ProductoRequest {
  return {
    idCategoriaProducto: values.idCategoriaProducto,
    idMarca: values.idMarca ? Number(values.idMarca) : undefined,
    idUnidadMedida: values.idUnidadMedida,
    codigoProducto: values.codigoProducto.trim(),
    nombreProducto: values.nombreProducto.trim(),
    procedencia: vacioAUndefined(values.procedencia),
    stock: values.stock,
    visibleWeb: values.visibleWeb,
    descripcion: vacioAUndefined(values.descripcion),
    caracteristicas: (values.caracteristicas ?? []).map((c) => ({
      nombreCaracteristica: c.nombreCaracteristica.trim(),
      valorCaracteristica: c.valorCaracteristica.trim(),
      unidadCaracteristica: vacioAUndefined(c.unidadCaracteristica),
    })),
  }
}

/** Convierte un producto del backend en los valores iniciales del formulario de edición. */
export function productoToFormValues(producto: Producto): ProductoFormValues {
  return {
    idCategoriaProducto: producto.idCategoriaProducto,
    idMarca: producto.idMarca ?? undefined,
    idUnidadMedida: producto.idUnidadMedida,
    codigoProducto: producto.codigoProducto,
    nombreProducto: producto.nombreProducto,
    procedencia: producto.procedencia ?? "",
    stock: producto.stock ?? 0,
    visibleWeb: producto.visibleWeb,
    descripcion: producto.descripcion ?? "",
    caracteristicas: (producto.caracteristicas ?? []).map((c) => ({
      nombreCaracteristica: c.nombreCaracteristica,
      valorCaracteristica: c.valorCaracteristica,
      unidadCaracteristica: c.unidadCaracteristica ?? "",
    })),
  }
}
