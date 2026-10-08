import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { FacturacionHistoricoItem } from "@/types/dashboard.types"
import { formatCurrency } from "@/lib/formatters/currency"
import { cn } from "@/lib/utils/utils"

interface FacturacionChartProps {
  data: FacturacionHistoricoItem[]
  tipo?: "barras" | "lineas"
  className?: string
}

const COLORES = {
  facturado: "var(--chart-1)",
  comparativa: "var(--muted-foreground)",
}

function formatearMesCorto(mes: string): string {
  const [anio, mesNum] = mes.split("-")
  const nombresMes = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
  const indice = Number(mesNum) - 1
  return `${nombresMes[indice] ?? mesNum}/${anio.slice(2)}`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || !label) return null

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-2">{formatearMesCorto(label)}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function FacturacionChart({ data, tipo = "barras", className }: FacturacionChartProps) {
  const safeData = Array.isArray(data) ? data : []
  
  if (safeData.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">Sin datos de facturación para el periodo seleccionado</p>
      </div>
    )
  }

  const chartData = safeData.map((item) => ({
    mes: formatearMesCorto(item.mes),
    facturado: item.monto,
    comparativa: item.comparativaAnoAnterior ?? 0,
    mesOriginal: item.mes,
  }))

  const hasComparativa = safeData.some((item) => item.comparativaAnoAnterior !== undefined && item.comparativaAnoAnterior !== null)

  const ChartComponent = tipo === "lineas" ? LineChart : BarChart
  const SeriesComponent = tipo === "lineas" ? Line : Bar

  return (
    <div className={cn("rounded-lg border border-border p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Facturación histórica</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: COLORES.facturado }} />
            Facturado
          </span>
          {hasComparativa && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: COLORES.comparativa }} />
              Año anterior
            </span>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="mes"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value).replace("PEN", "").trim()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "8px" }}
              formatter={(value) => (value === "facturado" ? "Facturado" : "Año anterior")}
            />
            <SeriesComponent
              type="monotone"
              dataKey="facturado"
              name="Facturado"
              stroke={COLORES.facturado}
              fill={COLORES.facturado}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            {hasComparativa && (
              <SeriesComponent
                type="monotone"
                dataKey="comparativa"
                name="Año anterior"
                stroke={COLORES.comparativa}
                fill={COLORES.comparativa}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6 }}
                opacity={0.7}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
