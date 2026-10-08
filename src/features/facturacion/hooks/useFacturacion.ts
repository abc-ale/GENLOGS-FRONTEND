import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { facturacionApi } from '@/api/facturacionApi'
import type { FacturacionFiltros, FacturaInput } from '@/types/facturacion.types'

export const facturacionKeys = {
  all: ['facturacion'] as const,
  lista: (filtros: FacturacionFiltros) => ['facturacion', filtros] as const,
}

export function useFacturas(filtros: FacturacionFiltros = {}) {
  return useQuery({ queryKey: facturacionKeys.lista(filtros), queryFn: () => facturacionApi.listar(filtros) })
}

export function useCrearFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FacturaInput) => facturacionApi.crear(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facturacionKeys.all }),
  })
}
