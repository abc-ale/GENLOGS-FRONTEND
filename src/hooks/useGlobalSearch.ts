import { useQuery } from "@tanstack/react-query"
import { clientesApi } from "@/api/clientesApi"
import { cotizacionesApi } from "@/api/cotizacionesApi"
import * as productosApi from "@/api/productosApi"

export interface ResultadoBusqueda {
  id: number
  titulo: string
  subtitulo?: string
}

export interface ResultadoBusquedaGlobal {
  clientes: ResultadoBusqueda[]
  cotizaciones: ResultadoBusqueda[]
  productos: ResultadoBusqueda[]
}

const resultadoVacio: ResultadoBusquedaGlobal = { clientes: [], cotizaciones: [], productos: [] }

/** Busca en paralelo sobre los tres catálogos que la búsqueda global (Ctrl+K)
 *  soporta. Clientes y productos filtran por nombre en el backend; las
 *  cotizaciones no tienen un parámetro de búsqueda de texto en la API, así
 *  que se trae la página más reciente y se filtra por código/cliente aquí. */
export function useGlobalSearch(termino: string) {
  const query = termino.trim()

  return useQuery({
    queryKey: ["busqueda-global", query],
    queryFn: async (): Promise<ResultadoBusquedaGlobal> => {
      const [clientes, cotizacionesResp, productosResp] = await Promise.all([
        clientesApi.listar({ razonSocial: query, size: 5 }),
        cotizacionesApi.listarCotizaciones({ size: 30, sortBy: "fechaCreacion", sortDir: "DESC" }),
        productosApi.listarProductos({ nombre: query, size: 5 }),
      ])

      const queryLower = query.toLowerCase()
      const cotizacionesFiltradas = (cotizacionesResp.content ?? [])
        .filter((c) => {
          const codigo = (c.codigoCotizacion ?? c.codigo ?? "").toLowerCase()
          const cliente = (c.cliente ?? c.clienteNombre ?? "").toLowerCase()
          return codigo.includes(queryLower) || cliente.includes(queryLower)
        })
        .slice(0, 5)

      return {
        clientes: clientes.slice(0, 5).map((c) => ({
          id: c.id,
          titulo: c.tercero.razonSocial,
          subtitulo: `${c.tercero.tipoDocumento} ${c.tercero.numeroDocumento}`,
        })),
        cotizaciones: cotizacionesFiltradas.map((c) => ({
          id: (c.idCotizacion ?? c.id)!,
          titulo: c.codigoCotizacion ?? c.codigo ?? `Cotización #${c.idCotizacion ?? c.id}`,
          subtitulo: c.cliente ?? c.clienteNombre,
        })),
        productos: (productosResp.content ?? []).slice(0, 5).map((p) => ({
          id: p.idProducto,
          titulo: p.nombreProducto,
          subtitulo: p.codigoProducto,
        })),
      }
    },
    enabled: query.length >= 2,
    placeholderData: resultadoVacio,
    staleTime: 15_000,
  })
}
