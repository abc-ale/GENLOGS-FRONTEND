import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { listarProductos } from '@/api/productosApi'
import type { Producto } from '@/types/producto.types'

interface Props {
  /** Texto mostrado cuando ya hay un producto elegido. */
  seleccionado?: string
  onSeleccionar: (producto: Producto) => void
  hasError?: boolean
}

/** Busca productos por código o nombre y muestra el stock disponible. */
export const ProductoBuscador: React.FC<Props> = ({
  seleccionado,
  onSeleccionar,
  hasError = false,
}) => {
  const [texto, setTexto] = useState('')
  const [debounced] = useDebounce(texto.trim(), 300)
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  const { data: resultados = [], isFetching: cargando } = useQuery({
    queryKey: ['productos-buscador-cotizacion', debounced],
    queryFn: async () => {
      const [porCodigo, porNombre] = await Promise.all([
        listarProductos({ codigo: debounced, size: 6 }),
        listarProductos({ nombre: debounced, size: 6 }),
      ])
      const unicos = new Map<number, Producto>()
      for (const producto of [...porCodigo.content, ...porNombre.content]) {
        unicos.set(producto.idProducto, producto)
      }
      return [...unicos.values()].slice(0, 8)
    },
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  })

  useEffect(() => {
    function cerrarAlHacerClicFuera(event: MouseEvent) {
      if (contenedor.current && !contenedor.current.contains(event.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', cerrarAlHacerClicFuera)
    return () => document.removeEventListener('mousedown', cerrarAlHacerClicFuera)
  }, [])

  const queryCorta = debounced.length < 2

  return (
    <div className="relative" ref={contenedor}>
      <div className="relative">
        <input
          value={texto}
          onChange={(event) => {
            setTexto(event.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          placeholder={seleccionado || 'Código o nombre del producto'}
          aria-label="Buscar producto por código o nombre"
          aria-expanded={abierto && !queryCorta}
          aria-controls="resultados-busqueda-productos"
          autoComplete="off"
          className={`w-full rounded-lg border bg-background px-3 py-2 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            hasError ? 'border-destructive' : 'border-input'
          } ${seleccionado && !texto ? 'placeholder:text-foreground' : ''}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
          {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </span>
      </div>

      {abierto && !queryCorta && (
        <ul
          id="resultados-busqueda-productos"
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {resultados.length === 0 && !cargando && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Sin resultados para “{debounced}”.
            </li>
          )}
          {resultados.map((producto) => (
            <li key={producto.idProducto} role="option">
              <button
                type="button"
                onClick={() => {
                  onSeleccionar(producto)
                  setTexto('')
                  setAbierto(false)
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {producto.nombreProducto}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {producto.codigoProducto}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  Stock: {producto.stock}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
