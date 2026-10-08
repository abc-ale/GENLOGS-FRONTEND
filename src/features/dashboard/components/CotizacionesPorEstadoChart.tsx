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
  APROBADA: "var(--chart-2)",
  PENDIENTE: "var(--chart-3)",
  RECHAZADA: "var(--chart-4)",
  BORRADOR: "var(--muted-foreground)",
  ENVIADA: "var(--chart-1)",
  EN_NEGOCIACION: "var(--chart-5)",
  ACEPTADA: "var(--chart-2)",
  CONVERTIDA_OC: "var(--primary)",
  VENCIDA: "var(--warning)",
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

function CustomLegend({ payload = [] }: { payload?: Array<{ value: number; color: string; id: string }> }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">
            {ESTADO_ETIQUETAS[entry.id] ?? entry.id}
          </span>
          <span className="text-xs font-medium text-foreground">
            ({formatNumber(entry.value)})
          </span>
        </div>
      ))}
    </div>
  )
}

export function CotizacionesPorEstadoChart({ data, className }: CotizacionesPorEstadoChartProps) {
  const safeData = Array.isArray(data) ? data : []
  
  if (safeData.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">Sin cotizaciones registradas</p>
      </div>
    )
  }

  const chartData = safeData.map((item) => ({
    ...item,
    label: ESTADO_ETIQUETAS[item.estado] ?? item.estado,
    color: ESTADO_COLORES[item.estado] ?? "var(--chart-1)",
  }))

  return (
    <div className={cn("rounded-lg border border-border p-4", className)}>
      <h2 className="text-sm font-semibold mb-4">Cotizaciones por estado</h2>

      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="var(--chart-1)"
              paddingAngle={2}
              dataKey="cantidad"
              nameKey="estado"
              label={({ payload, percent }) => `${payload.label} ${((percent ?? 0) * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              formatter={(value) => ESTADO_ETIQUETAS[value] ?? value}
              wrapperStyle={{ paddingTop: "20px" }}
              content={<CustomLegend />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
