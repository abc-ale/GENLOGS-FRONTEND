import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordenesCompraApi } from '@/api/ordenesCompraApi'
import type { EstadoOrdenCompra, OrdenCompraFiltros, OrdenCompraInput } from '@/types/ordenCompra.types'

export const ordenesCompraKeys = {
  all: ['ordenes-compra'] as const,
  lista: (filtros: OrdenCompraFiltros) => ['ordenes-compra', filtros] as const,
  detalle: (id: number) => ['ordenes-compra', id] as const,
}

export function useOrdenesCompra(filtros: OrdenCompraFiltros = {}) {
  return useQuery({ queryKey: ordenesCompraKeys.lista(filtros), queryFn: () => ordenesCompraApi.listar(filtros) })
}

export function useCrearOrdenCompra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrdenCompraInput) => ordenesCompraApi.crear(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordenesCompraKeys.all }),
  })
}

export function useCambiarEstadoOrdenCompra(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (estado: EstadoOrdenCompra) => ordenesCompraApi.cambiarEstado(id, estado),
    onSuccess: (data) => {
      queryClient.setQueryData(ordenesCompraKeys.detalle(id), data)
      return queryClient.invalidateQueries({ queryKey: ordenesCompraKeys.all })
    },
  })
}
