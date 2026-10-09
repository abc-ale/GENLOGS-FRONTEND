// src/lib/validators/cotizacion.schema.ts

import { z } from 'zod';
import { CondicionPago, Moneda, EstadoCotizacion } from '@/types/cotizacion.types';

export const cotizacionDetalleSchema = z.object({
  idProducto: z.number({ message: 'Selecciona un producto' }).min(1, 'Selecciona un producto'),
  idUnidadMedida: z.number().min(1),
  codigoProducto: z.string().optional(),
  producto: z.string().optional(),
  unidadMedida: z.string().optional(),
  stock: z.number().optional(),
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0, 'El precio unitario no puede ser negativo'),
  subtotal: z.number().min(0),
});

export type CotizacionDetalleFormData = z.infer<typeof cotizacionDetalleSchema>;

export const crearCotizacionSchema = z.object({
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
  condicionPago: z.nativeEnum(CondicionPago, {
    message: 'Debe seleccionar una condición de pago válida',
  }),
  moneda: z.nativeEnum(Moneda, {
    message: 'Debe seleccionar una moneda válida',
  }),
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional(),
  detalles: z.array(cotizacionDetalleSchema).min(1, 'Debe agregar al menos un detalle'),
});

export type CrearCotizacionFormData = z.infer<typeof crearCotizacionSchema>;

export const filtrosCotizacionSchema = z.object({
  estadoCotizacion: z.nativeEnum(EstadoCotizacion).optional(),
  clienteId: z.number().optional(),
  moneda: z.nativeEnum(Moneda).optional(),
  page: z.number().min(0).default(0),
  size: z.number().min(5).max(100).default(10),
  sortBy: z.string().default('fechaCreacion'),
  sortDir: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type FiltrosCotizacionFormData = z.infer<typeof filtrosCotizacionSchema>;

export const cambiarEstadoCotizacionSchema = z.object({
  estadoNuevo: z.nativeEnum(EstadoCotizacion, {
    message: 'Debe seleccionar un estado válido',
  }),
  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional(),
});

export type CambiarEstadoCotizacionFormData = z.infer<typeof cambiarEstadoCotizacionSchema>;

export const enviarCotizacionSchema = z.object({
  correoDestinatario: z.string().email('Debe ingresar un correo válido'),
  asunto: z.string().min(3, 'El asunto debe tener al menos 3 caracteres').max(200),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000),
  incluirDetalles: z.boolean(),
});

export type EnviarCotizacionFormData = z.infer<typeof enviarCotizacionSchema>;