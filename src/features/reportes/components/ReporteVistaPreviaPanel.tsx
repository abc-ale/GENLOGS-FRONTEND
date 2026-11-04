import { FileSearch, Loader2 } from "lucide-react"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { cn } from "@/lib/utils/utils"
import type { ReporteVistaPrevia, TipoReporte } from "@/types/reporte.types"

const TITULOS: Record<TipoReporte, string> = {
  COTIZACIONES: "Cotizaciones",
  ORDENES_COMPRA: "Órdenes de compra",
  FACTURACION: "Facturación",
  SERVICIOS: "Servicios",
  PRODUCTOS: "Productos",
}

interface Props {
  datos?: ReporteVistaPrevia
  cargando: boolean
  error: boolean
  /** Rango con el que se generó la vista previa, para mostrarlo en el encabezado. */
  rango?: { fechaInicio: string; fechaFin: string } | null
}

const esMonto = (encabezado: string) => /total|monto/i.test(encabezado)

function formatearCelda(valor: string, encabezado: string): string {
  if (esMonto(encabezado) && valor.trim() !== "" && Number.isFinite(Number(valor))) {
    return Number(valor).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return valor
}

function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-")
  return y && m && d ? `${d}/${m}/${y}` : iso
}

export function ReporteVistaPreviaPanel({ datos, cargando, error, rango }: Props) {
  return (
    <section
      aria-label="Vista previa del reporte"
      className="flex min-h-[28rem] min-w-0 flex-col rounded-xl border border-border bg-card shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Vista previa</h2>
          {datos && (
            <p className="text-xs text-muted-foreground">
              {TITULOS[datos.tipoReporte]}
              {rango && ` · ${fechaCorta(rango.fechaInicio)} al ${fechaCorta(rango.fechaFin)}`}
            </p>
          )}
        </div>
        {datos && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {datos.totalFilas.toLocaleString("es-PE")} {datos.totalFilas === 1 ? "registro" : "registros"}
          </span>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {cargando && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
            Preparando vista previa…
          </div>
        )}

        {!cargando && error && (
          <div className="p-5">
            <ErrorBanner message="No se pudo cargar la vista previa. Revisa las fechas e intenta de nuevo." />
          </div>
        )}

        {!cargando && !error && !datos && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileSearch className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Aún no hay vista previa</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Elige el tipo de reporte y el rango de fechas, y pulsa «Vista previa» para ver los datos antes de descargarlos.
            </p>
          </div>
        )}

        {!cargando && !error && datos && datos.filas.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 p-10 text-center">
            <p className="text-sm font-medium text-foreground">Sin resultados</p>
            <p className="text-xs text-muted-foreground">No hay registros para ese tipo de reporte y rango de fechas.</p>
          </div>
        )}

        {!cargando && !error && datos && datos.filas.length > 0 && (
          <>
            <div className="max-h-[32rem] min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {datos.encabezados.map((h) => (
                      <th key={h} className={cn("whitespace-nowrap px-4 py-3 font-medium", esMonto(h) && "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.filas.map((fila, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      {fila.map((celda, j) => (
                        <td
                          key={j}
                          className={cn(
                            "px-4 py-2.5 text-foreground",
                            esMonto(datos.encabezados[j]) ? "whitespace-nowrap text-right font-medium tabular-nums" : "max-w-[18rem] truncate",
                          )}
                          title={celda}
                        >
                          {formatearCelda(celda, datos.encabezados[j]) || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              {datos.truncado
                ? `Mostrando las primeras ${datos.filas.length} de ${datos.totalFilas.toLocaleString("es-PE")} filas. El archivo descargado incluye todas.`
                : `Mostrando ${datos.filas.length} ${datos.filas.length === 1 ? "fila" : "filas"}.`}
            </footer>
          </>
        )}
      </div>
    </section>
  )
}