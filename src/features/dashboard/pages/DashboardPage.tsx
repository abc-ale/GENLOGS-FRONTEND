import { Users, DollarSign, FileText, ShoppingCart, TrendingUp, RefreshCw, BarChart3, Plus, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { useDashboardData } from "../hooks/useDashboardData"
import { IndicadorCard } from "../components/IndicadorCard"
import { CotizacionesPorEstadoChart } from "../components/CotizacionesPorEstadoChart"
import { FacturacionChart } from "../components/FacturacionChart"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { formatCurrency, formatPercentage } from "@/lib/formatters/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/utils"
import { useAuthStore } from "@/features/auth/store/authStore"

function IndicadorSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-11 w-11 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 h-72", className)}>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-full w-full" />
    </div>
  )
}

function EmptyChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
}

/** Saludo según la hora del día — pequeño detalle que hace sentir la
 *  pantalla "viva" sin depender de ningún dato del backend. */
function saludo() {
  const hora = new Date().getHours()
  if (hora < 12) return "Buenos días"
  if (hora < 19) return "Buenas tardes"
  return "Buenas noches"
}

const quickActions = [
  { icon: Plus, label: "Nueva cotización", href: "/cotizaciones/nueva" },
  { icon: Package, label: "Nuevo producto", href: "/catalogo-repuestos/nuevo" },
  { icon: ShoppingCart, label: "Órdenes de compra", href: "/ordenes-compra" },
  { icon: FileText, label: "Facturación", href: "/facturacion" },
]

export function DashboardPage() {
  const nombreUsuario = useAuthStore((s) => s.nombreUsuario)
  const {
    indicadores,
    facturacionHistorico,
    cotizacionesPorEstado,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardData()

  const fechaHoy = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <IndicadorSkeleton key={i} />
          ))}
        </div>
        <EmptyChartsSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">No se pudieron cargar los datos</h2>
          <p className="text-sm text-muted-foreground">{error?.message ?? "Error desconocido"}</p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    )
  }

  if (!indicadores) return null

  const variacion = indicadores.porcentajeVariacionFacturacion ?? 0
  const clientesActivos = indicadores.clientesActivos ?? 0
  const totalFacturado = indicadores.totalFacturado ?? 0
  const cotizacionesPendientes = indicadores.cotizacionesPendientes ?? 0
  const ordenesCompraProceso = indicadores.ordenesCompraProceso ?? 0
  const hasCotizaciones = cotizacionesPorEstado.length > 0
  const hasFacturacion = facturacionHistorico.length > 0

  const kpiCards = [
    {
      icon: Users,
      label: "Clientes activos",
      value: String(clientesActivos),
      trend: variacion,
      trendLabel: variacion >= 0 ? `+${variacion.toFixed(1)}%` : `${variacion.toFixed(1)}%`,
      iconBgColor: "bg-success/10",
      iconColor: "text-success",
    },
    {
      icon: DollarSign,
      label: "Total facturado",
      value: formatCurrency(totalFacturado),
      subtitle: `Variación: ${formatPercentage(variacion)}`,
      iconBgColor: "bg-info/10",
      iconColor: "text-info",
    },
    {
      icon: FileText,
      label: "Cotizaciones pendientes",
      value: String(cotizacionesPendientes),
      iconBgColor: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      icon: ShoppingCart,
      label: "Órdenes en proceso",
      value: String(ordenesCompraProceso),
      iconBgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      icon: TrendingUp,
      label: "Variación facturación",
      value: `${variacion >= 0 ? "+" : ""}${variacion.toFixed(1)}%`,
      subtitle: "vs mes anterior",
      iconBgColor: variacion >= 0 ? "bg-success/10" : "bg-destructive/10",
      iconColor: variacion >= 0 ? "text-success" : "text-destructive",
    },
    {
      icon: DollarSign,
      label: "Ticket promedio",
      value:
        cotizacionesPendientes > 0
          ? formatCurrency(totalFacturado / Math.max(cotizacionesPendientes, 1))
          : formatCurrency(0),
      subtitle: "Estimado por cotización",
      iconBgColor: "bg-muted",
      iconColor: "text-muted-foreground",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {saludo()}{nombreUsuario ? `, ${nombreUsuario}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{fechaHoy}</p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-4 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div
              className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-accent/25 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-white/40">
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent" />
              <action.icon className="relative h-4.5 w-4.5" />
            </div>
            <span className="relative text-sm font-medium text-foreground leading-tight">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((card, index) => (
          <IndicadorCard key={index} {...card} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-sm">
          <CotizacionesPorEstadoChart data={cotizacionesPorEstado ?? []} className="p-5 h-72" />
          {!hasCotizaciones && (
            <EmptyStateCard
              icon={<FileText className="h-7 w-7" strokeWidth={1.5} />}
              title="No hay cotizaciones aún"
              description="Comienza creando tu primera cotización para ver el desglose por estado en este gráfico."
              action={{
                label: "Crear cotización",
                href: "/cotizaciones/nueva",
              }}
            />
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-sm">
          <FacturacionChart data={facturacionHistorico ?? []} className="p-5 h-72" />
          {!hasFacturacion && (
            <EmptyStateCard
              icon={<BarChart3 className="h-7 w-7" strokeWidth={1.5} />}
              title="Sin datos de facturación"
              description="No hay facturación registrada para el periodo seleccionado. Los datos aparecerán aquí una vez que factures."
              action={{
                label: "Ver facturación",
                href: "/facturacion",
                variant: "outline",
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
