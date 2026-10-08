import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as productosApi from "@/api/productosApi"
import type { ProductoFiltros } from "@/types/producto.types"
import type { PageResponse } from "@/types/common.types"

export const productosKeys = {
  all: ["productos"] as const,
  lista: (filtros: ProductoFiltros) => ["productos", "lista", filtros] as const,
  detalle: (id: number) => ["productos", "detalle", id] as const,
}

const emptyPageResponse: PageResponse<any> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 12,
}

/** Catálogo paginado. Mantiene la página anterior visible mientras carga la siguiente. */
export function useProductos(filtros: ProductoFiltros) {
  return useQuery({
    queryKey: productosKeys.lista(filtros),
    queryFn: () => productosApi.listarProductos(filtros),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    // FIX: initialData para evitar undefined
    initialData: emptyPageResponse,
  })
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: productosKeys.detalle(id),
    queryFn: () => productosApi.obtenerProducto(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productosApi.eliminarProducto(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: productosKeys.detalle(id) })
      return queryClient.invalidateQueries({ queryKey: productosKeys.all })
    },
  })
}