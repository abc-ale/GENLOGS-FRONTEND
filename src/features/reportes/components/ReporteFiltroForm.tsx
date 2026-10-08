import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reporteFiltroSchema } from "@/lib/validators/reporteFiltro.schema"
import { anioActual, mesActual, trimestreActual, ultimosDias, type RangoFechas } from "@/lib/formatters/rangoFechas"
import type { ReporteRequest, TipoReporte, FormatoReporte } from "@/types/reporte.types"

interface ReporteFiltroFormProps {
  onSubmit: (valores: ReporteRequest) => void
  enviando?: boolean
}

const OPCIONES_TIPO: { value: TipoReporte; label: string }[] = [
  { value: "COTIZACIONES", label: "Cotizaciones" },
  { value: "ORDENES_COMPRA", label: "Órdenes de Compra" },
  { value: "FACTURACION", label: "Facturación" },
  { value: "SERVICIOS", label: "Servicios" },
  { value: "PRODUCTOS", label: "Productos" },
]

const OPCIONES_FORMATO: { value: FormatoReporte; label: string }[] = [
  { value: "EXCEL", label: "Excel (.xlsx)" },
  { value: "PDF", label: "PDF" },
]

const RANGOS_RAPIDOS: { label: string; calcular: () => RangoFechas }[] = [
  { label: "Últimos 30 días", calcular: () => ultimosDias(30) },
  { label: "Mes actual", calcular: () => mesActual() },
  { label: "Trimestre actual", calcular: () => trimestreActual() },
  { label: "Año actual", calcular: () => anioActual() },
]

export function ReporteFiltroForm({ onSubmit, enviando }: ReporteFiltroFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReporteRequest>({
    resolver: zodResolver(reporteFiltroSchema),
    defaultValues: {
      tipoReporte: "SERVICIOS",
      formato: "EXCEL",
      fechaInicio: "",
      fechaFin: "",
    },
  })

  function aplicarRango(rango: RangoFechas) {
    setValue("fechaInicio", rango.fechaInicio, { shouldValidate: true })
    setValue("fechaFin", rango.fechaFin, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div>
        <label className="text-sm font-medium">Tipo de reporte</label>
        <select
          {...register("tipoReporte")}
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        >
          {OPCIONES_TIPO.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        {errors.tipoReporte && <p className="text-sm text-destructive">{errors.tipoReporte.message}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGOS_RAPIDOS.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => aplicarRango(r.calcular())}
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Fecha inicio</label>
          <input
            type="date"
            {...register("fechaInicio")}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          {errors.fechaInicio && <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Fecha fin</label>
          <input
            type="date"
            {...register("fechaFin")}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          {errors.fechaFin && <p className="text-sm text-destructive">{errors.fechaFin.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Formato</label>
        <select
          {...register("formato")}
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        >
          {OPCIONES_FORMATO.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        {errors.formato && <p className="text-sm text-destructive">{errors.formato.message}</p>}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {enviando ? "Generando..." : "Generar reporte"}
      </button>
    </form>
  )
}
