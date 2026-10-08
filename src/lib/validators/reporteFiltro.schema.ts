import { z } from "zod"

export const DIAS_MAXIMO_RANGO = 365
const MS_POR_DIA = 1000 * 60 * 60 * 24

export const TIPOS_REPORTE = ["COTIZACIONES", "ORDENES_COMPRA", "FACTURACION", "SERVICIOS", "PRODUCTOS"] as const
export const FORMATOS_REPORTE = ["PDF", "EXCEL"] as const

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida")

/**
 * Debe mantenerse compatible con `ReporteRequest` (types/reporte.types.ts):
 * tipoReporte y formato en MAYÚSCULAS, fechas en formato YYYY-MM-DD.
 */
export const reporteFiltroSchema = z
  .object({
    tipoReporte: z.enum(TIPOS_REPORTE, { message: "Selecciona un tipo de reporte" }),
    fechaInicio: fechaSchema,
    fechaFin: fechaSchema,
    formato: z.enum(FORMATOS_REPORTE, { message: "Selecciona un formato" }),
  })
  .superRefine((v, ctx) => {
    const inicio = Date.parse(v.fechaInicio)
    const fin = Date.parse(v.fechaFin)
    if (Number.isNaN(inicio) || Number.isNaN(fin)) return

    if (inicio > fin) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaInicio"],
        message: "La fecha de inicio no puede ser mayor a la fecha fin",
      })
    } else if ((fin - inicio) / MS_POR_DIA > DIAS_MAXIMO_RANGO) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaFin"],
        message: `El rango no puede exceder ${DIAS_MAXIMO_RANGO} días`,
      })
    }
  })

export type ReporteFiltroValues = z.infer<typeof reporteFiltroSchema>
