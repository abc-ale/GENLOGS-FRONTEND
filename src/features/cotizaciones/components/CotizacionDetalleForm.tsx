// src/features/cotizaciones/components/CotizacionDetalleForm.tsx
// ✅ VERSION SIN ANY - Compatible con ESLint strict

import React, { useCallback } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import type { CrearCotizacionFormData } from '@/lib/validators/cotizacion.schema';
import { formatearMoneda, calcularSubtotal, calcularTotalConMargen } from '@/lib/formatters/codigoCotizacion';
import { Trash2, Plus } from 'lucide-react';

interface CotizacionDetalleFormProps {
  moneda: string;
}

export const CotizacionDetalleForm: React.FC<CotizacionDetalleFormProps> = ({
  moneda,
}) => {
  const { control, watch, formState: { errors } } = useFormContext<CrearCotizacionFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalles',
  });

  const detalles = watch('detalles');

  const agregarDetalle = useCallback(() => {
    append({
      cantidad: 1,
      precioUnitario: 0,
      margenPorcentaje: 0,
      subtotal: 0,
    });
  }, [append]);

  const calcularTotales = useCallback(() => {
    let subtotalGeneral = 0;
    let totalConMargen = 0;

    detalles?.forEach((detalle) => {
      if (detalle) {
        const sub = calcularSubtotal(detalle.cantidad, detalle.precioUnitario);
        const total = calcularTotalConMargen(sub, detalle.margenPorcentaje);
        subtotalGeneral += sub;
        totalConMargen += total;
      }
    });

    return { subtotalGeneral, totalConMargen, igv: subtotalGeneral * 0.18 };
  }, [detalles]);

  const totales = calcularTotales();

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Detalles de Cotización
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega productos o servicios a la cotización
          </p>
        </div>
        <button
          type="button"
          onClick={agregarDetalle}
          className="inline-flex items-center px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Línea
        </button>
      </div>

      {errors.detalles && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-destructive">
            {typeof errors.detalles.message === 'string'
              ? errors.detalles.message
              : 'Error en los detalles de cotización'}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted">
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Producto/Servicio
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                Cantidad
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                Precio Unit.
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                Margen %
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                Subtotal
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <DetalleRow
                key={field.id}
                index={index}
                moneda={moneda}
                onRemove={() => remove(index)}
                control={control}
                errors={errors}
              />
            ))}
          </tbody>
        </table>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No hay detalles. Haz clic en "Agregar Línea" para comenzar.
          </p>
          <button
            type="button"
            onClick={agregarDetalle}
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Línea
          </button>
        </div>
      )}

      {/* Resumen de totales */}
      {fields.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-border space-y-3">
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between text-foreground">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">
                  {formatearMoneda(totales.subtotalGeneral, moneda)}
                </span>
              </div>
              <div className="flex justify-between text-foreground">
                <span className="font-medium">IGV (18%):</span>
                <span className="font-semibold">
                  {formatearMoneda(totales.igv, moneda)}
                </span>
              </div>
              <div className="flex justify-between text-lg text-foreground bg-muted p-3 rounded-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold">
                  {formatearMoneda(totales.subtotalGeneral + totales.igv, moneda)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DetalleRowProps {
  index: number;
  moneda: string;
  onRemove: () => void;
  control: ReturnType<typeof useFormContext<CrearCotizacionFormData>>['control'];
  errors: ReturnType<typeof useFormContext<CrearCotizacionFormData>>['formState']['errors'];
}

const DetalleRow: React.FC<DetalleRowProps> = ({
  index,
  moneda,
  onRemove,
  control,
  errors,
}) => {
  const { watch: fieldWatch } = useFormContext<CrearCotizacionFormData>();
  const detalles = fieldWatch('detalles');
  const detalle = detalles?.[index];

  const subtotal = detalle
    ? calcularSubtotal(detalle.cantidad, detalle.precioUnitario)
    : 0;
  const totalConMargen = detalle
    ? calcularTotalConMargen(subtotal, detalle.margenPorcentaje)
    : 0;

  return (
    <tr className="border-b border-border hover:bg-muted transition">
      {/* Producto/Servicio */}
      <td className="px-4 py-3">
        <Controller
          name={`detalles.${index}.producto`}
          control={control}
          render={({ field }) => (
            <div>
              <input
                {...field}
                value={field.value || ''}
                type="text"
                placeholder="Nombre del producto o servicio"
                className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors?.detalles?.[index]?.producto
                    ? 'border-destructive'
                    : 'border-border'
                }`}
              />
              {errors?.detalles?.[index]?.producto && (
                <p className="text-xs text-destructive mt-1">
                  {errors.detalles[index]?.producto?.message}
                </p>
              )}
            </div>
          )}
        />
      </td>

      {/* Cantidad */}
      <td className="px-4 py-3">
        <Controller
          name={`detalles.${index}.cantidad`}
          control={control}
          render={({ field }) => (
            <div>
              <input
                {...field}
                type="number"
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min="1"
                step="1"
                className={`w-full px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors?.detalles?.[index]?.cantidad
                    ? 'border-destructive'
                    : 'border-border'
                }`}
              />
            </div>
          )}
        />
      </td>

      {/* Precio Unitario */}
      <td className="px-4 py-3">
        <Controller
          name={`detalles.${index}.precioUnitario`}
          control={control}
          render={({ field }) => (
            <div>
              <input
                {...field}
                type="number"
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors?.detalles?.[index]?.precioUnitario
                    ? 'border-destructive'
                    : 'border-border'
                }`}
              />
            </div>
          )}
        />
      </td>

      {/* Margen % */}
      <td className="px-4 py-3">
        <Controller
          name={`detalles.${index}.margenPorcentaje`}
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex items-center">
                <input
                  {...field}
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className={`w-full px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors?.detalles?.[index]?.margenPorcentaje
                      ? 'border-destructive'
                      : 'border-border'
                  }`}
                />
                <span className="ml-1 text-muted-foreground">%</span>
              </div>
            </div>
          )}
        />
      </td>

      {/* Subtotal */}
      <td className="px-4 py-3 text-right font-semibold text-foreground">
        <div className="space-y-1">
          <div className="text-sm">
            {formatearMoneda(subtotal, moneda)}
          </div>
          {detalle?.margenPorcentaje && detalle.margenPorcentaje > 0 && (
            <div className="text-xs text-success font-medium">
              +{formatearMoneda(totalConMargen - subtotal, moneda)} margen
            </div>
          )}
        </div>
      </td>

      {/* Eliminar */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
          title="Eliminar esta línea"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};