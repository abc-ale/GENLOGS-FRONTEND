import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { listarCategoriasProducto } from "@/api/categoriasApi"
import type { CategoriaProducto } from "@/api/categoriasApi"
import { cn } from "@/lib/utils/utils"

interface CategoriaSelectorProps {
  value: number | undefined
  /** Recibe `undefined` cuando se elige la opción vacía (solo si `permitirVacio`). */
  onChange: (idCategoria: number | undefined) => void
  /** Agrega una opción para limpiar la selección (útil en filtros). */
  permitirVacio?: boolean
  placeholder?: string
  textoVacio?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  className?: string
  "aria-describedby"?: string
}

interface OpcionCategoria {
  categoria: CategoriaProducto
  profundidad: number
}

/**
 * Ordena las categorías como árbol (padre → hijos) sin depender del orden
 * en que las devuelva el backend.
 */
function ordenarComoArbol(categorias: CategoriaProducto[]): OpcionCategoria[] {
  const ids = new Set(categorias.map((c) => c.idCategoriaProducto))
  const hijosPorPadre = new Map<number | undefined, CategoriaProducto[]>()

  for (const categoria of categorias) {
    // Si el padre no viene en la lista, se trata como raíz para no perder la categoría.
    const padre =
      categoria.idCategoriaPadre !== undefined && ids.has(categoria.idCategoriaPadre)
        ? categoria.idCategoriaPadre
        : undefined
    const grupo = hijosPorPadre.get(padre) ?? []
    grupo.push(categoria)
    hijosPorPadre.set(padre, grupo)
  }

  const resultado: OpcionCategoria[] = []
  const visitados = new Set<number>()

  function recorrer(padre: number | undefined, profundidad: number) {
    const hijos = (hijosPorPadre.get(padre) ?? [])
      .slice()
      .sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria, "es"))

    for (const hijo of hijos) {
      if (visitados.has(hijo.idCategoriaProducto)) continue
      visitados.add(hijo.idCategoriaProducto)
      resultado.push({ categoria: hijo, profundidad })
      recorrer(hijo.idCategoriaProducto, profundidad + 1)
    }
  }

  recorrer(undefined, 0)
  return resultado
}

export function CategoriaSelector({
  value,
  onChange,
  permitirVacio = false,
  placeholder = "Selecciona una categoría",
  textoVacio = "Todas las categorías",
  disabled = false,
  invalid = false,
  id,
  className,
  "aria-describedby": ariaDescribedBy,
}: CategoriaSelectorProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categorias-producto"],
    queryFn: listarCategoriasProducto,
    staleTime: 5 * 60_000,
  })

  const opciones = useMemo(() => ordenarComoArbol(data ?? []), [data])

  if (isError) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <span className="text-destructive">No se cargaron las categorías.</span>
        <button type="button" onClick={() => refetch()} className="text-primary underline underline-offset-4">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      disabled={disabled || isLoading}
      aria-invalid={invalid || undefined}
      aria-describedby={ariaDescribedBy}
      className={cn(
        "h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-destructive" : "border-input",
        className
      )}
    >
      {permitirVacio ? (
        <option value="">{isLoading ? "Cargando categorías…" : textoVacio}</option>
      ) : (
        <option value="" disabled>
          {isLoading ? "Cargando categorías…" : placeholder}
        </option>
      )}
      {opciones.map(({ categoria, profundidad }) => (
        <option key={categoria.idCategoriaProducto} value={categoria.idCategoriaProducto}>
          {"\u00A0\u00A0".repeat(profundidad)}
          {profundidad > 0 ? "↳ " : ""}
          {categoria.nombreCategoria}
        </option>
      ))}
    </select>
  )
}
