// src/features/cotizaciones/hooks/useCrearCotizacion.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { cotizacionesApi } from '@/api/cotizacionesApi';
import type { Cotizacion } from '@/types/cotizacion.types';
import type { CrearCotizacionFormData } from '@/lib/validators/cotizacion.schema';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  status?: number;
}

/**
 * Hook para crear una nueva cotización
 */
export function useCrearCotizacion(): UseMutationResult<
  Cotizacion,
  AxiosError<ErrorResponse>,
  CrearCotizacionFormData
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearCotizacionFormData) =>
      cotizacionesApi.crearDesdeFormulario(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-estadisticas'] });
      queryClient.setQueryData(['cotizaciones', data.id], data);
    },
    onError: (error) => {
      console.error('Error al crear cotización:', error);
    },
  });
}