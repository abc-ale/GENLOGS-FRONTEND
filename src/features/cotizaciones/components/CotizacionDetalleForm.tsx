import React from 'react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { Plus, Trash2, PackageSearch } from 'lucide-react'
import type { CrearCotizacionFormData } from '@/lib/validators/cotizacion.schema'
import { formatearMoneda } from '@/lib/formatters/codigoCotizacion'
import { ProductoBuscador } from './ProductoBuscador'

interface Props {
  moneda: string
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export const CotizacionDetalleForm: React.FC<Props> = ({ moneda }) => {
  const { control, watch, setValue, formState: { errors } } = useFormContext<CrearCotizacionFormData>()
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })
  const detalles = watch('detalles') ?? []

  const subtotal = detalles.reduce((acc, d) => acc + (d?.cantidad || 0) * (d?.precioUnitario || 0), 0)
  const igv = subtotal * 0.18

  const agregar = () =>
    append({
      idProducto: undefined as unknown as number,
      idUnidadMedida: undefined as unknown as number,
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
    })

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Productos de la cotización</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Busca cada producto por su código o nombre, indica la cantidad y el precio.
          </p>
        </div>
        <button
          type="button"
          onClick={agregar}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Agregar producto
        </button>
      </div>

      {typeof errors.detalles?.message === 'string' && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.detalles.message}
        </p>
      )}

      {fields.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
          <PackageSearch className="h-9 w-9 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Aún no agregaste productos.</p>
          <button
            type="button"
            onClick={agregar}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Agregar el primer producto
          </button>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const d = detalles[index]
          const importe = (d?.cantidad || 0) * (d?.precioUnitario || 0)
          const errLinea = errors.detalles?.[index]
          return (
            <div key={field.id} className="rounded-xl border border-border bg-background/50 p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-5">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Producto</label>
                  <ProductoBuscador
                    hasError={!!errLinea?.idProducto}
                    seleccionado={d?.producto ? `${d.codigoProducto ?? ''} · ${d.producto}` : undefined}
                    onSeleccionar={(p) => {
                      setValue(`detalles.${index}.idProducto`, p.idProducto, { shouldValidate: true })
                      setValue(`detalles.${index}.idUnidadMedida`, p.idUnidadMedida, { shouldValidate: true })
                      setValue(`detalles.${index}.codigoProducto`, p.codigoProducto)
                      setValue(`detalles.${index}.producto`, p.nombreProducto)
                      setValue(`detalles.${index}.stock`, p.stock)
                    }}
                  />
                  {d?.producto ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.codigoProducto} · {d.producto}
                      {typeof d.stock === 'number' ? ` · Stock: ${d.stock}` : ''}
                    </p>
                  ) : errLinea?.idProducto ? (
                    <p className="mt-1 text-xs text-destructive">Selecciona un producto de la lista.</p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Cantidad</label>
                  <Controller
                    name={`detalles.${index}.cantidad`}
                    control={control}
                    render={({ field: f }) => (
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={f.value || ''}
                        onChange={(e) => f.onChange(Number(e.target.value))}
                        className={`${inputCls} text-center`}
                      />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Precio unit.</label>
                  <Controller
                    name={`detalles.${index}.precioUnitario`}
                    control={control}
                    render={({ field: f }) => (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={f.value || ''}
                        onChange={(e) => f.onChange(Number(e.target.value))}
                        className={`${inputCls} text-right`}
                      />
                    )}
                  />
                </div>

                <div className="flex items-end justify-between gap-2 md:col-span-3">
                  <div className="text-right md:flex-1">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Importe</p>
                    <p className="py-2 text-sm font-semibold text-foreground">{formatearMoneda(importe, moneda)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    title="Quitar producto"
                    className="mb-0.5 rounded-lg p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end border-t border-border pt-4">
          <div className="w-full space-y-2 sm:w-80">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatearMoneda(subtotal, moneda)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IGV (18%)</span>
              <span className="font-medium">{formatearMoneda(igv, moneda)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3 text-base font-bold">
              <span>Total</span>
              <span>{formatearMoneda(subtotal + igv, moneda)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}