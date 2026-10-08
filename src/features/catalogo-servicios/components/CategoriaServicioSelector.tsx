import type { CategoriaServicio } from "@/api/categoriasServicioApi"

interface CategoriaServicioSelectorProps {
  categorias: CategoriaServicio[] | undefined
  isLoading: boolean
  value: number | undefined
  onChange: (idCategoriaServicio: number) => void
  className?: string
}

export function CategoriaServicioSelector({
  categorias,
  isLoading,
  value,
  onChange,
  className,
}: CategoriaServicioSelectorProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={isLoading}
      className={className ?? "rounded-md border border-border px-3 py-2 text-sm"}
    >
      <option value="" disabled>
        {isLoading ? "Cargando categorías..." : "Selecciona una categoría"}
      </option>
      {categorias?.map((cat) => (
        <option key={cat.idCategoriaServicio} value={cat.idCategoriaServicio}>
          {cat.nombreCategoria}
        </option>
      ))}
    </select>
  )
}