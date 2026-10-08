import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils/utils"

export interface PipelineStep {
  label: string
  /** "completed": ya ocurrió (ej. la cotización que dio origen a esta orden).
   *  "current": la pantalla que se está viendo ahora mismo.
   *  "pending": todavía no existe (ej. la factura de una orden sin facturar). */
  status: "completed" | "current" | "pending"
  href?: string
}

/** Breadcrumb del pipeline de negocio: Cotización → Orden de Compra → Factura.
 *  Exigido por la lógica de UX del proyecto ("Relación Cotización → Orden →
 *  Factura visible como breadcrumb") para que alguien en el detalle de un
 *  documento sepa de un vistazo de dónde viene y hacia dónde va, sin tener
 *  que ir a buscarlo en el texto. */
export function PipelineBreadcrumb({ steps }: { steps: PipelineStep[] }) {
  return (
    <nav aria-label="Origen y destino del documento" className="flex items-center gap-2 text-sm">
      {steps.map((step, i) => {
        const contenido = (
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors",
              step.status === "current" && "bg-accent/10 text-accent",
              step.status === "completed" && "text-foreground hover:bg-muted",
              step.status === "pending" && "text-muted-foreground"
            )}
          >
            {step.status === "completed" && <Check className="h-3.5 w-3.5 text-success" />}
            {step.label}
          </span>
        )

        return (
          <span key={step.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-border">/</span>}
            {step.href && step.status !== "current" ? (
              <Link
                to={step.href}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contenido}
              </Link>
            ) : (
              contenido
            )}
          </span>
        )
      })}
    </nav>
  )
}
