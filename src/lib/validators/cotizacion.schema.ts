import { z } from 'zod';
import { CondicionPago, Moneda, EstadoCotizacion } from '@/types/cotizacion.types';

export const cotizacionDetalleSchema = z.object({
  id: z.number().optional(),
  idProducto: z.number().optional(),
  idServicio: z.number().optional(),
  idUnidadMedida: z.number().optional(),
  stockDisponible: z.number().optional(),
  producto: z.string().optional(),
  servicio: z.string().optional(),
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0, 'El precio unitario no puede ser negativo'),
  margenPorcentaje: z.number().min(0).max(100, 'El margen debe estar entre 0 y 100%'),
  subtotal: z.number().min(0),
  descripcion: z.string().optional(),
}).superRefine((detalle, ctx) => {
  if (!detalle.idProducto && !detalle.idServicio) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['producto'], message: 'Selecciona un producto o servicio del catálogo.' });
  }
  if (!detalle.idUnidadMedida) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['producto'], message: 'El ítem seleccionado no tiene unidad de medida.' });
  }
  if (detalle.idProducto && detalle.stockDisponible !== undefined && detalle.cantidad > detalle.stockDisponible) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cantidad'], message: `La cantidad supera el stock disponible (${detalle.stockDisponible}).` });
  }
});

export type CotizacionDetalleFormData = z.infer<typeof cotizacionDetalleSchema>;

export const crearCotizacionSchema = z.object({
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
  condicionPago: z.nativeEnum(CondicionPago, { message: 'Debe seleccionar una condición de pago válida' }),
  moneda: z.nativeEnum(Moneda, { message: 'Debe seleccionar una moneda válida' }),
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional(),
  detalles: z.array(cotizacionDetalleSchema).min(1, 'Debe agregar al menos un detalle'),
});

export type CrearCotizacionFormData = z.infer<typeof crearCotizacionSchema>;

export const filtrosCotizacionSchema = z.object({
  estadoCotizacion: z.nativeEnum(EstadoCotizacion).optional(), clienteId: z.number().optional(), moneda: z.nativeEnum(Moneda).optional(),
  page: z.number().min(0).default(0), size: z.number().min(5).max(100).default(10), sortBy: z.string().default('fechaCreacion'), sortDir: z.enum(['ASC', 'DESC']).default('DESC'),
});
export type FiltrosCotizacionFormData = z.infer<typeof filtrosCotizacionSchema>;
export const cambiarEstadoCotizacionSchema = z.object({ estadoNuevo: z.nativeEnum(EstadoCotizacion, { message: 'Debe seleccionar un estado válido' }), observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional() });
export type CambiarEstadoCotizacionFormData = z.infer<typeof cambiarEstadoCotizacionSchema>;
export const enviarCotizacionSchema = z.object({ correoDestinatario: z.string().email('Debe ingresar un correo válido'), asunto: z.string().min(3, 'El asunto debe tener al menos 3 caracteres').max(200), mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000), incluirDetalles: z.boolean() });
export type EnviarCotizacionFormData = z.infer<typeof enviarCotizacionSchema>;
