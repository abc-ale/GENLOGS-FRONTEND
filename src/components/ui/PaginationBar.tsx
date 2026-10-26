import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  itemLabel: string
  onPageChange: (page: number) => void
  busy?: boolean
}

/** Barra compartida para las listas del sistema (página base cero). */
export function PaginationBar({ currentPage, totalPages, totalItems, pageSize, itemLabel, onPageChange, busy = false }: PaginationBarProps) {
  if (totalPages <= 1 || totalItems <= 0) return null
  const first = currentPage * pageSize
  const visible = Math.max(0, Math.min(pageSize, totalItems - first))
  return (
    <nav aria-label={`Paginación de ${itemLabel}`} className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <p className="text-sm text-slate-600">Mostrando <span className="font-semibold text-slate-900">{visible}</span> de <span className="font-semibold text-slate-900">{totalItems}</span> {itemLabel}</p>
      <div className="flex items-center justify-between gap-1 rounded-full bg-slate-50 p-1 sm:justify-start">
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 0 || busy} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-400">
          <ChevronLeft className="h-4 w-4" aria-hidden="true"/><span>Anterior</span>
        </button>
        <span aria-current="page" className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">Página <span className="font-semibold text-blue-700">{currentPage + 1}</span> de {totalPages}</span>
        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage + 1 >= totalPages || busy} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400">
          <span>Siguiente</span><ChevronRight className="h-4 w-4" aria-hidden="true"/>
        </button>
      </div>
    </nav>
  )
}
