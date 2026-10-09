import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "use-debounce"
import { Search, FileText, Users, Package, CornerDownLeft, X } from "lucide-react"
import { useGlobalSearch } from "@/hooks/useGlobalSearch"

interface GlobalSearchDialogProps {
  open: boolean
  onClose: () => void
}

type TipoResultado = "cliente" | "cotizacion" | "producto"

interface ResultadoPlano {
  key: string
  tipo: TipoResultado
  titulo: string
  subtitulo?: string
  ruta: string
}

const iconoPorTipo: Record<TipoResultado, React.ElementType> = {
  cliente: Users,
  cotizacion: FileText,
  producto: Package,
}

const etiquetaPorTipo: Record<TipoResultado, string> = {
  cliente: "Cliente",
  cotizacion: "Cotización",
  producto: "Producto",
}

/** Paleta de búsqueda global (Ctrl+K / Cmd+K). Sigue el patrón de
 *  ConfirmDialog (overlay + Escape + click-afuera, sin dependencias nuevas)
 *  y el estilo "vidrio" de la cáscara (header/drawer), no el de las pantallas
 *  operativas — este es un elemento de shell, no una tabla. */
export function GlobalSearchDialog({ open, onClose }: GlobalSearchDialogProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [terminoDebounced] = useDebounce(query, 250)
  const [indiceActivo, setIndiceActivo] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isFetching } = useGlobalSearch(terminoDebounced)

  const resultados = useMemo<ResultadoPlano[]>(() => {
    if (!data) return []
    return [
      ...data.clientes.map((c) => ({
        key: `cliente-${c.id}`,
        tipo: "cliente" as const,
        titulo: c.titulo,
        subtitulo: c.subtitulo,
        ruta: `/clientes/${c.id}`,
      })),
      ...data.cotizaciones.map((c) => ({
        key: `cotizacion-${c.id}`,
        tipo: "cotizacion" as const,
        titulo: c.titulo,
        subtitulo: c.subtitulo,
        ruta: `/cotizaciones/${c.id}`,
      })),
      ...data.productos.map((p) => ({
        key: `producto-${p.id}`,
        tipo: "producto" as const,
        titulo: p.titulo,
        subtitulo: p.subtitulo,
        ruta: `/catalogo-repuestos/${p.id}`,
      })),
    ]
  }, [data])

  useEffect(() => {
    if (open) {
      setQuery("")
      setIndiceActivo(0)
      document.body.style.overflow = "hidden"
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
    document.body.style.overflow = ""
  }, [open])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    setIndiceActivo(0)
  }, [terminoDebounced])

  function irA(resultado: ResultadoPlano) {
    navigate(resultado.ruta)
    onClose()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      onClose()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setIndiceActivo((i) => Math.min(i + 1, Math.max(resultados.length - 1, 0)))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setIndiceActivo((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const seleccionado = resultados[indiceActivo]
      if (seleccionado) irA(seleccionado)
    }
  }

  if (!open) return null

  const terminoValido = terminoDebounced.trim().length >= 2

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda global"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/10"
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cotizaciones, clientes o productos…"
            className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!terminoValido && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Escribe al menos 2 caracteres para buscar.
            </p>
          )}
          {terminoValido && isFetching && resultados.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Buscando…</p>
          )}
          {terminoValido && !isFetching && resultados.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Sin resultados para "{terminoDebounced}".
            </p>
          )}
          {resultados.map((resultado, i) => {
            const Icono = iconoPorTipo[resultado.tipo]
            const activo = i === indiceActivo
            return (
              <button
                key={resultado.key}
                type="button"
                onMouseEnter={() => setIndiceActivo(i)}
                onClick={() => irA(resultado)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activo ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    activo ? "bg-accent/15" : "bg-muted"
                  }`}
                >
                  <Icono className={`h-4 w-4 ${activo ? "text-accent" : "text-muted-foreground"}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{resultado.titulo}</span>
                  {resultado.subtitulo && (
                    <span className="block truncate text-xs text-muted-foreground">{resultado.subtitulo}</span>
                  )}
                </span>
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {etiquetaPorTipo[resultado.tipo]}
                </span>
                {activo && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ para navegar · Enter para abrir · Esc para cerrar</span>
        </div>
      </div>
    </div>
  )
}
