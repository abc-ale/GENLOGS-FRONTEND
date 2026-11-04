import { useState } from "react"
import { BarChart3 } from "lucide-react"
import { useGenerarReporte } from "../hooks/useGenerarReporte"
import { useVistaPreviaReporte } from "../hooks/useVistaPreviaReporte"
import { ReporteFiltroForm } from "../components/ReporteFiltroForm"
import { ReporteVistaPreviaPanel } from "../components/ReporteVistaPreviaPanel"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import type { ReporteRequest } from "@/types/reporte.types"

export function ReportesPage() {
  const generarReporte = useGenerarReporte()
  const vistaPrevia = useVistaPreviaReporte()
  const [rango, setRango] = useState<{ fechaInicio: string; fechaFin: string } | null>(null)

  function handleSubmit(valores: ReporteRequest) {
    generarReporte.mutate(valores)
  }

  function handlePreview(valores: ReporteRequest) {
    setRango({ fechaInicio: valores.fechaInicio, fechaFin: valores.fechaFin })
    vistaPrevia.mutate(valores)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
        <p className="text-sm text-muted-foreground">Genera y descarga reportes con los filtros que necesites.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-card text-accent ring-1 ring-border/60">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Generar reporte</h2>
          </div>
          <ReporteFiltroForm
            onSubmit={handleSubmit}
            onPreview={handlePreview}
            enviando={generarReporte.isPending}
            cargandoVistaPrevia={vistaPrevia.isPending}
          />

          {generarReporte.isError && (
            <div className="mt-4">
              <ErrorBanner message="Ocurrió un error al generar el reporte. Intenta de nuevo." />
            </div>
          )}

          {generarReporte.isSuccess && (
            <p className="mt-4 text-sm font-medium text-success">
              Reporte generado y descargado correctamente.
            </p>
          )}
        </div>

        <ReporteVistaPreviaPanel
          datos={vistaPrevia.data}
          cargando={vistaPrevia.isPending}
          error={vistaPrevia.isError}
          rango={rango}
        />
      </div>
    </div>
  )
}