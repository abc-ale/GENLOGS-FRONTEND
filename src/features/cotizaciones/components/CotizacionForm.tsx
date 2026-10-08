import type { Cliente } from '@/types/cliente.types'
import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { CrearCotizacionFormData } from '@/lib/validators/cotizacion.schema'
import { CondicionPago, Moneda } from '@/types/cotizacion.types'
import { mapearCondicionPago } from '@/lib/formatters/codigoCotizacion'

interface CotizacionFormProps {
  clientes: Cliente[]
  isLoadingClientes?: boolean
}

export const CotizacionForm: React.FC<CotizacionFormProps> = ({ clientes, isLoadingClientes = false }) => {
  const { control, formState: { errors } } = useFormContext<CrearCotizacionFormData>()

  return (
    <div className="space-y-6 bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Información de la Cotización</h2>
        <p className="text-sm text-muted-foreground">Selecciona el cliente y configura las condiciones generales.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Cliente *</label>
        <Controller
          name="clienteId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              disabled={isLoadingClientes}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">-- Selecciona un cliente --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.tercero.razonSocial} - {cliente.tercero.numeroDocumento}
                </option>
              ))}
            </select>
          )}
        />
        {errors.clienteId && <p className="mt-1 text-sm text-destructive">{errors.clienteId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Condición de pago *</label>
        <Controller
          name="condicionPago"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(CondicionPago).map((condicion) => (
                <label
                  key={condicion}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    field.value === condicion ? 'border-accent bg-accent/10' : 'border-input hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    checked={field.value === condicion}
                    onChange={() => field.onChange(condicion)}
                    className="accent-accent"
                  />
                  <span className="ml-3 text-sm text-foreground">{mapearCondicionPago(condicion)}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Moneda *</label>
        <Controller
          name="moneda"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(Moneda).map((moneda) => (
                <label
                  key={moneda}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    field.value === moneda ? 'border-accent bg-accent/10' : 'border-input hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    checked={field.value === moneda}
                    onChange={() => field.onChange(moneda)}
                    className="accent-accent"
                  />
                  <span className="ml-2 text-sm text-foreground">{moneda}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Observaciones</label>
        <Controller
          name="observaciones"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              value={field.value || ''}
              rows={4}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Notas adicionales"
            />
          )}
        />
      </div>
    </div>
  )
}
