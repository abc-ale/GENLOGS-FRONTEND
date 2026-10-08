// src/features/cotizaciones/hooks/useCambiarEstado.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { cotizacionesApi } from '@/api/cotizacionesApi';
import type { Cotizacion, UpdateEstadoCotizacionRequest } from '@/types/cotizacion.types';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  status?: number;
}

/**
 * Hook para cambiar el estado de una cotización
 */
export function useCambiarEstado(
  cotizacionId: number
): UseMutationResult<
  Cotizacion,
  AxiosError<ErrorResponse>,
  UpdateEstadoCotizacionRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEstadoCotizacionRequest) =>
      cotizacionesApi.cambiarEstadoCotizacion(cotizacionId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({
        queryKey: ['cotizaciones', cotizacionId],
      });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-estadisticas'] });
      queryClient.setQueryData(['cotizaciones', data.id], data);
    },
    onError: (error) => {
      console.error('Error al cambiar estado de cotización:', error);
    },
  });
}