// src/features/cotizaciones/hooks/useCotizacionesMutations.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { cotizacionesApi } from '@/api/cotizacionesApi';
import type {
  Cotizacion,
  EnviarCotizacionRequest,
  AdjuntoCotizacion,
} from '@/types/cotizacion.types';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  status?: number;
}

/**
 * Hook para cargar un adjunto a una cotización
 */
export function useCargarAdjunto(
  cotizacionId: number
): UseMutationResult<
  AdjuntoCotizacion,
  AxiosError<ErrorResponse>,
  File
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archivo: File) =>
      cotizacionesApi.cargarAdjunto(cotizacionId, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cotizaciones', cotizacionId],
      });
    },
    onError: (error) => {
      console.error('Error al cargar adjunto:', error);
    },
  });
}

/**
 * Hook para eliminar un adjunto de una cotización
 */
export function useEliminarAdjunto(
  cotizacionId: number
): UseMutationResult<void, AxiosError<ErrorResponse>, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adjuntoId: number) =>
      cotizacionesApi.eliminarAdjunto(cotizacionId, adjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cotizaciones', cotizacionId],
      });
    },
    onError: (error) => {
      console.error('Error al eliminar adjunto:', error);
    },
  });
}

/**
 * Hook para enviar una cotización por correo
 */
export function useEnviarCotizacion(
  cotizacionId: number
): UseMutationResult<
  { success: boolean; mensaje: string },
  AxiosError<ErrorResponse>,
  EnviarCotizacionRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnviarCotizacionRequest) =>
      cotizacionesApi.enviarCotizacion(cotizacionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cotizaciones', cotizacionId],
      });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
    onError: (error) => {
      console.error('Error al enviar cotización:', error);
    },
  });
}

/**
 * Hook para descargar una cotización en PDF
 */
export function useDescargarPDF(
  cotizacionId: number,
  nombreArchivo?: string
): UseMutationResult<Blob, AxiosError<ErrorResponse>, void> {
  return useMutation({
    mutationFn: () => cotizacionesApi.descargarCotizacionPDF(cotizacionId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo || `cotizacion-${cotizacionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Error al descargar PDF:', error);
    },
  });
}

/**
 * Hook para duplicar una cotización
 */
export function useDuplicarCotizacion(): UseMutationResult<
  Cotizacion,
  AxiosError<ErrorResponse>,
  number
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cotizacionId: number) =>
      cotizacionesApi.duplicarCotizacion(cotizacionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.setQueryData(['cotizaciones', data.id], data);
    },
    onError: (error) => {
      console.error('Error al duplicar cotización:', error);
    },
  });
}