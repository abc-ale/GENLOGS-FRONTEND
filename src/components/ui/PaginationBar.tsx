import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  itemLabel: string
  onPageChange: (page: number) => void
  busy?: boolean
}

/** Lista de páginas visibles con elipsis: 1 … 4 5 [6] 7 8 … 38 (índices base cero). */
function paginasVisibles(actual: number, total: number): Array<number | 'gap-izq' | 'gap-der'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const out: Array<number | 'gap-izq' | 'gap-der'> = [0]
  const desde = Math.max(1, actual - 1)
  const hasta = Math.min(total - 2, actual + 1)
  if (desde > 1) out.push('gap-izq')
  for (let i = desde; i <= hasta; i++) out.push(i)
  if (hasta < total - 2) out.push('gap-der')
  out.push(total - 1)
  return out
}

const nav = 'inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300'

/** Barra compartida para las listas del sistema (página base cero). */
export function PaginationBar({ currentPage, totalPages, totalItems, pageSize, itemLabel, onPageChange, busy = false }: PaginationBarProps) {
  if (totalPages <= 1 || totalItems <= 0) return null
  const desde = currentPage * pageSize + 1
  const hasta = Math.min(totalItems, (currentPage + 1) * pageSize)
  const esPrimera = currentPage <= 0
  const esUltima = currentPage + 1 >= totalPages
  const ir = (p: number) => { if (!busy && p >= 0 && p < totalPages && p !== currentPage) onPageChange(p) }

  return (
    <nav
      aria-label={`Paginación de ${itemLabel}`}
      className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-between sm:px-6"
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Mostrando <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{desde}–{hasta}</span>{' '}
        de <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{totalItems.toLocaleString('es-PE')}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <button type="button" aria-label="Primera página" onClick={() => ir(0)} disabled={esPrimera || busy} className={`${nav} hidden sm:inline-flex`}>
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Página anterior" onClick={() => ir(currentPage - 1)} disabled={esPrimera || busy} className={nav}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* En móvil solo "Página X de Y"; en pantallas más anchas, los números */}
        <span aria-current="page" className="px-3 text-sm tabular-nums text-slate-500 dark:text-slate-400 sm:hidden">
          Página <span className="font-semibold text-blue-700 dark:text-blue-300">{currentPage + 1}</span> de {totalPages}
        </span>
        <div className="mx-1 hidden items-center gap-1 sm:flex">
          {paginasVisibles(currentPage, totalPages).map((p) =>
            typeof p === 'number' ? (
              <button
                key={p}
                type="button"
                onClick={() => ir(p)}
                disabled={busy}
                aria-label={`Ir a la página ${p + 1}`}
                aria-current={p === currentPage ? 'page' : undefined}
                className={
                  p === currentPage
                    ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-semibold tabular-nums text-white shadow-sm shadow-blue-600/25'
                    : 'inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-medium tabular-nums text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait dark:text-slate-300 dark:hover:bg-slate-800'
                }
              >
                {p + 1}
              </button>
            ) : (
              <span key={p} aria-hidden="true" className="inline-flex h-9 w-6 items-end justify-center pb-2 text-slate-400">…</span>
            ),
          )}
        </div>

        <button type="button" aria-label="Página siguiente" onClick={() => ir(currentPage + 1)} disabled={esUltima || busy} className={nav}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Última página" onClick={() => ir(totalPages - 1)} disabled={esUltima || busy} className={`${nav} hidden sm:inline-flex`}>
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}