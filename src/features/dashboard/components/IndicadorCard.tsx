import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface IndicadorCardProps {
  icon: LucideIcon
  label: string
  value: string
  subtitle?: string
  trend?: number
  trendLabel?: string
  iconBgColor?: string
  iconColor?: string
}

function TrendIndicator({ trend, label }: { trend: number; label?: string }) {
  if (trend === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>{label ?? "Sin cambios"}</span>
      </div>
    )
  }

  const isPositive = trend > 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isPositive ? "text-success" : "text-destructive"
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{label ?? `${isPositive ? "+" : ""}${trend.toFixed(1)}%`}</span>
    </div>
  )
}

export function IndicadorCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
}: IndicadorCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-lg">
      {/* Mancha de color desenfocada propia de cada tarjeta — asoma por una
          esquina como en un widget "liquid glass", tiñendo el vidrio con
          el color semántico del indicador (éxito, alerta, acento…). */}
      <div
        className={cn(
          "pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl opacity-60 transition-opacity group-hover:opacity-80",
          iconBgColor
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Ícono en una "burbuja" de vidrio: fondo con degradado sutil +
            reflejo superior, en vez de un círculo plano de un solo tono. */}
        <div
          className={cn(
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/40",
            iconBgColor,
            iconColor
          )}
        >
          <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/40 to-transparent" />
          <Icon className="relative h-5.5 w-5.5" />
        </div>
        {trend !== undefined && <TrendIndicator trend={trend} label={trendLabel} />}
      </div>
      <div className="relative min-w-0 flex-1 mt-3">
        <p className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2">{label}</p>
        <p className="mt-1.5 text-3xl font-bold text-foreground tracking-tight font-mono">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{subtitle}</p>}
      </div>
    </div>
  )
}