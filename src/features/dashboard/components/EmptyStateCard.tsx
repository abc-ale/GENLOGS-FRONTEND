import { Link } from "react-router-dom"
import { cn } from "@/lib/utils/utils"

interface EmptyStateCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
    variant?: "primary" | "outline"
  }
  className?: string
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/80 backdrop-blur-sm p-10 text-center shadow-sm transition-shadow hover:shadow-md", className)}>
      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
        {/* Halo degradado detrás del ícono — da un aire "ilustrado"
            en vez de un círculo plano de un solo color. */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card text-accent shadow-sm ring-1 ring-border/60">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
      {action && (
        <div className="mt-6">
          {action.variant === "outline" ? (
            <Link
              to={action.href}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {action.label}
            </Link>
          ) : (
            <Link
              to={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {action.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}