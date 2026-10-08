import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonRowsProps {
  /** Cuántas filas "fantasma" mostrar mientras carga. */
  rows?: number
  /** Cuántas columnas tiene la tabla (una <td> con un Skeleton por columna). */
  columns: number
}

/** Placeholders con la forma de la fila final, en vez de un spinner genérico
 *  centrado. Es el mismo patrón que ya usa el Dashboard (percibido como más
 *  rápido y profesional) — homologado aquí para todas las tablas del sistema. */
export function TableSkeletonRows({ rows = 5, columns }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-border" aria-hidden="true">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="p-3">
              <Skeleton className="h-4" style={{ width: `${55 + ((i * 13 + j * 29) % 35)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
