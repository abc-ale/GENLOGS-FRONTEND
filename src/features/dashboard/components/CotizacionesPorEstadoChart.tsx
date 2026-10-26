import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { CotizacionEstadoItem } from "@/types/dashboard.types"
import { formatNumber, formatPercentage } from "@/lib/formatters/currency"
import { cn } from "@/lib/utils/utils"

interface CotizacionesPorEstadoChartProps {
  data: CotizacionEstadoItem[]
  className?: string
}

const ESTADO_COLORES: Record<string, string> = {
  APROBADA: "#1D4ED8",
  PENDIENTE: "#0F766E",
  RECHAZADA: "#64748B",
  BORRADOR: "#CBD5E1",
  ENVIADA: "#60A5FA",
  EN_NEGOCIACION: "#6366F1",
  ACEPTADA: "#2563EB",
  CONVERTIDA_OC: "#38BDF8",
  VENCIDA: "#3B82F6",
  ANULADA: "#94A3B8",
}

const ESTADO_ETIQUETAS: Record<string, string> = {
  APROBADA: "Aprobada",
  PENDIENTE: "Pendiente",
  RECHAZADA: "Rechazada",
  BORRADOR: "Borrador",
  ENVIADA: "Enviada",
  EN_NEGOCIACION: "En negociación",
  ACEPTADA: "Aceptada",
  CONVERTIDA_OC: "Convertida a OC",
  VENCIDA: "Vencida",
  ANULADA: "Anulada",
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; payload: CotizacionEstadoItem }> }) {
  if (!active || !payload || !payload[0]) return null

  const item = payload[0].payload
  const total = payload.reduce((acc, p) => acc + p.value, 0)

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg min-w-[180px]">
      <p className="text-sm font-medium" style={{ color: payload[0].color }}>
        {ESTADO_ETIQUETAS[item.estado] ?? item.estado}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Cantidad: <span className="font-medium text-foreground">{formatNumber(item.cantidad)}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Porcentaje: <span className="font-medium text-foreground">{formatPercentage(item.porcentaje)}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Total: <span className="font-medium text-foreground">{formatNumber(total)}</span>
      </p>
    </div>
  )
}

function CustomLegend({ payload = [] }: { payload?: Array<{ value: string; color: string; payload?: CotizacionEstadoItem }> }) {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">
            {ESTADO_ETIQUETAS[String(entry.value)] ?? String(entry.value)}
          </span>
          <span className="text-xs font-medium text-foreground">
            ({formatNumber(Number(entry.payload?.cantidad ?? 0))})
          </span>
        </div>
      ))}
    </div>
  )
}

export function CotizacionesPorEstadoChart({ data, className }: CotizacionesPorEstadoChartProps) {
  const safeData = Array.isArray(data) ? data : []

  // 3) Datos inválidos (NaN): el backend puede mandar `cantidad`/`porcentaje`
  // como null, undefined o string no numérico. Se descartan los valores no
  // numéricos o <= 0 ANTES de pasárselos a la gráfica (evita "(NaN)" en la
  // leyenda y sectores de tamaño 0) y se recalcula el porcentaje cuando el
  // recibido no es válido.
  const entradas = safeData.filter(
    (item) => Number.isFinite(Number(item.cantidad)) && Number(item.cantidad) > 0
  )
  const totalCantidad = entradas.reduce((acc, item) => acc + Number(item.cantidad), 0)

  const chartData = entradas.map((item) => {
    const estado = (String(item.estado ?? "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "")) || "DESCONOCIDO"
    const cantidad = Number(item.cantidad)
    const porcentajeBackend = Number(item.porcentaje)
    const porcentaje =
      Number.isFinite(porcentajeBackend) && porcentajeBackend > 0
        ? porcentajeBackend
        : totalCantidad > 0
          ? (cantidad / totalCantidad) * 100
          : 0
    return {
      ...item,
      estado,
      cantidad,
      porcentaje,
      label: ESTADO_ETIQUETAS[estado] ?? estado,
      color: ESTADO_COLORES[estado] ?? "var(--chart-1)",
    }
  })

  if (chartData.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">Sin cotizaciones registradas</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col rounded-lg border border-border p-4", className)}>
      <h2 className="mb-3 shrink-0 text-sm font-semibold">Cotizaciones por estado</h2>

      {/* 1) Contenedor responsivo y centrado (ejes X/Y): el área tiene un alto
          que cabe exactamente en la tarjeta del dashboard (h-72 con su padding
          y título ≈ 216 px disponibles), así la dona ya no desborda ni se
          recorta en el borde inferior del contenedor. */}
      <div className="flex h-52 w-full min-w-0 flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              // 2) Radios proporcionales: en recharts 3 un porcentaje se aplica
              // sobre maxRadius (calculado con width/height/cx/cy), así la dona
              // se encoge sola con el contenedor y deja el anillo exterior
              // libre para las etiquetas de porcentaje sin pisarse.
              innerRadius="52%"
              outerRadius="75%"
              fill="var(--chart-1)"
              paddingAngle={2}
              dataKey="cantidad"
              nameKey="estado"
              label={false}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* 2) Leyenda en la parte inferior y centrada; recharts reserva su
                alto propio y el área del gráfico no se monta encima. */}
            <Legend layout="horizontal" align="center" verticalAlign="bottom" content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}