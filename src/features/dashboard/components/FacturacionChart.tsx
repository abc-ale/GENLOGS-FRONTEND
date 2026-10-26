import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FacturacionHistoricoItem } from "@/types/dashboard.types"
import { formatCurrency } from "@/lib/formatters/currency"
import { cn } from "@/lib/utils/utils"

interface FacturacionChartProps {
  data: FacturacionHistoricoItem[]
  tipo?: "barras" | "lineas"
  className?: string
}

const COLOR_LINEA = "#203F68"
const COLOR_AREA = "#DCEBFA"
const COLOR_MAXIMO = "#C96B00"
const COLOR_COMPARATIVA = "#94A3B8"

function formatearMesCorto(mes: string): string {
  const [anio, mesNum] = mes.split("-")
  const nombresMes = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
  const indice = Number(mesNum) - 1
  const nombre = nombresMes[indice] ?? mesNum
  return anio ? `${nombre}/${anio.slice(2)}` : nombre
}

function formatearEje(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)} mil`
  return value.toFixed(0)
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length || !label) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(Number(entry.value))}
        </p>
      ))}
    </div>
  )
}

export function FacturacionChart({ data, tipo = "lineas", className }: FacturacionChartProps) {
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
    facturado: Number(item.monto) || 0,
    comparativa: Number(item.comparativaAnoAnterior) || 0,
  }))
  const hasComparativa = safeData.some((item) => item.comparativaAnoAnterior != null)
  const maxIndex = chartData.reduce(
    (best, item, index, items) => item.facturado > items[best].facturado ? index : best,
    0
  )

  return (
    <div className={cn("rounded-lg border border-border p-4", className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Facturación histórica</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Evolución mensual</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR_LINEA }} />
          Facturado
        </span>
      </div>

      <div className="h-48 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="facturacionArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_AREA} stopOpacity={0.95} />
                <stop offset="100%" stopColor={COLOR_AREA} stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              minTickGap={16}
              tick={{ fill: "#64748B", fontSize: 10 }}
            />
            <YAxis
              width={64}
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              tick={{ fill: "#64748B", fontSize: 10 }}
              tickFormatter={formatearEje}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type={tipo === "lineas" ? "monotone" : "linear"}
              dataKey="facturado"
              name="Facturado"
              stroke={COLOR_LINEA}
              strokeWidth={3}
              fill="url(#facturacionArea)"
              dot={(props) => {
                const { cx, cy, index } = props
                if (index !== maxIndex || cx == null || cy == null) return null
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={7} fill="white" stroke={COLOR_MAXIMO} strokeWidth={3} />
                    <text x={cx} y={cy - 13} textAnchor="middle" fill={COLOR_MAXIMO} fontSize={12} fontWeight={700}>
                      {formatearEje(chartData[maxIndex].facturado)}
                    </text>
                  </g>
                )
              }}
              activeDot={{ r: 5, fill: "white", stroke: COLOR_LINEA, strokeWidth: 2.5 }}
            />
            {hasComparativa && (
              <Line
                type="monotone"
                dataKey="comparativa"
                name="Año anterior"
                stroke={COLOR_COMPARATIVA}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
