import { z } from "zod"

/**
 * Validación del formulario de servicios.
 * Los campos siguen `ServicioFormValues` (types/servicio.types.ts), que es el
 * contrato real con el backend: IDs numéricos y `idsSectores`.
 */
export const servicioSchema = z.object({
  idCategoriaServicio: z.number({ message: "Selecciona una categoría" }),
  idUnidadMedida: z.number({ message: "Selecciona una unidad de medida" }),
  codigoServicio: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(30, "El código no puede exceder 30 caracteres"),
  nombreServicio: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  duracionEstimadaHoras: z
    .number({ message: "Ingresa un número válido" })
    .positive("La duración debe ser mayor a 0")
    .optional(),
  visibleWeb: z.boolean(),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  idsSectores: z.array(z.number()),
})

export type ServicioSchemaValues = z.infer<typeof servicioSchema>
