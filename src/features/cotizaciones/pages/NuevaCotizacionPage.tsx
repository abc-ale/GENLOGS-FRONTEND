// src/features/cotizaciones/pages/NuevaCotizacionPage.tsx

import React, { useState } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { crearCotizacionSchema, type CrearCotizacionFormData } from '@/lib/validators/cotizacion.schema';
import { useCrearCotizacion } from '../hooks/useCrearCotizacion';
import { CotizacionForm } from '../components/CotizacionForm';
import { CotizacionDetalleForm } from '../components/CotizacionDetalleForm';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { useClientes } from '@/features/clientes-proveedores/hooks/useClientes';



export const NuevaCotizacionPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'detalles' | 'success'>('info');
  
  // FIX: Usar hook real en lugar de mock
  const { data: clientes = [], isLoading: cargandoClientes } = useClientes({});

  const methods = useForm<CrearCotizacionFormData>({
    resolver: zodResolver(crearCotizacionSchema),
    mode: 'onChange',
    defaultValues: {
      clienteId: undefined as number | undefined,
      condicionPago: undefined,
      moneda: undefined,
      observaciones: '',
      detalles: [],
    },
  });

  const { mutate: crearCotizacion, isPending, isSuccess, data: cotizacionCreada } =
    useCrearCotizacion();

const moneda = useWatch({ control: methods.control, name: 'moneda' });

  const handlePrimerPaso = async () => {
    const isValid = await methods.trigger(['clienteId', 'condicionPago', 'moneda'] as const);
    if (isValid) {
      setStep('detalles');
    }
  };

  const onSubmit = (data: CrearCotizacionFormData) => {
    crearCotizacion(data);
  };

  if (step === 'success' && isSuccess && cotizacionCreada) {
    return (
      <div className="min-h-screen bg-muted py-8 px-4 flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-xl p-8 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="bg-success/10 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            ¡Cotización Creada!
          </h2>
          <p className="text-muted-foreground mb-2">
            La cotización <span className="font-semibold">{cotizacionCreada.codigo}</span> ha sido
            creada exitosamente
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Total: {cotizacionCreada.moneda} {cotizacionCreada.total.toFixed(2)}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/cotizaciones')}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition font-medium"
            >
              Ver Todas
            </button>
            <button
              onClick={() =>
                navigate(`/cotizaciones/${cotizacionCreada.id}`)
              }
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/cotizaciones')}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Nueva Cotización
            </h1>
            <p className="text-muted-foreground mt-1">
              {step === 'info'
                ? 'Paso 1: Información General'
                : 'Paso 2: Detalles de Productos y Servicios'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-4">
          <div
            className={`flex-1 h-2 rounded-full transition ${
              step === 'info' || step === 'detalles'
                ? 'bg-accent'
                : 'bg-success'
            }`}
          />
          <div
            className={`flex-1 h-2 rounded-full transition ${
              step === 'detalles' || step === 'success'
                ? 'bg-accent'
                : 'bg-muted'
            }`}
          />
        </div>

        {/* Form */}
        <FormProvider<CrearCotizacionFormData> {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {step === 'info' && (
             <CotizacionForm clientes={clientes} isLoadingClientes={cargandoClientes} />
            )}

            {step === 'detalles' && (
              <CotizacionDetalleForm moneda={moneda || 'PEN'} />
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {step === 'detalles' && (
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition font-medium"
                >
                  Atrás
                </button>
              )}

              {step === 'info' && (
                <button
                  type="button"
                  onClick={handlePrimerPaso}
                  className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
                >
                  Siguiente
                </button>
              )}

              {step === 'detalles' && (
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Crear Cotización
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </FormProvider>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-accent/10 border border-accent/30 rounded-lg">
          <p className="text-sm text-accent">
            <span className="font-semibold">💡 Consejo:</span> Puedes guardar
            como borrador y continuar más tarde. Los datos se guardarán
            automáticamente en el navegador.
          </p>
        </div>
      </div>
    </div>
  );
};
