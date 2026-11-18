import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { facturacionApi } from '@/api/facturacionApi'
import type {
  CondicionPagoCatalogo,
  EstadoFacturacion,
  FacturacionFiltros,
  FacturaInput,
  MonedaCatalogo,
  TipoComprobanteCatalogo,
} from '@/types/facturacion.types'

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

// Referencias estables mientras cargan, para no disparar efectos en cada render.
const SIN_TIPOS: TipoComprobanteCatalogo[] = []
const SIN_MONEDAS: MonedaCatalogo[] = []
const SIN_CONDICIONES: CondicionPagoCatalogo[] = []

/** Tipos de comprobante, monedas y condiciones de pago para el formulario de facturación. */
export function useCatalogosFacturacion() {
  const tipos = useQuery({ queryKey: ['tipos-comprobante'], queryFn: facturacionApi.listarTiposComprobante, staleTime: 1000 * 60 * 30 })
  const monedas = useQuery({ queryKey: ['monedas'], queryFn: facturacionApi.listarMonedas, staleTime: 1000 * 60 * 30 })
  const condiciones = useQuery({ queryKey: ['condiciones-pago'], queryFn: facturacionApi.listarCondicionesPago, staleTime: 1000 * 60 * 30 })
  return {
    tipos: tipos.data ?? SIN_TIPOS,
    monedas: monedas.data ?? SIN_MONEDAS,
    condiciones: condiciones.data ?? SIN_CONDICIONES,
    isLoading: tipos.isLoading || monedas.isLoading || condiciones.isLoading,
    isError: tipos.isError || monedas.isError || condiciones.isError,
  }
}

export function useCambiarEstadoFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoFacturacion }) => facturacionApi.cambiarEstado(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facturacionKeys.all }),
  })
}