import { AlertCircle } from "lucide-react"

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

/**
 * Banner de error consistente para usar en cualquier pantalla que liste
 * datos (Usuarios, Facturación, Órdenes de compra, Cotizaciones, etc.).
 * Antes cada página pintaba su propio error con estilos distintos.
 */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-medium underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
