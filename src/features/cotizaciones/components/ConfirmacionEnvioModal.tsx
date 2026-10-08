import React from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  enviarCotizacionSchema,
  type EnviarCotizacionFormData,
} from "@/lib/validators/cotizacion.schema";
import { useEnviarCotizacion } from "../hooks/useCotizacionesMutations";
import { X, Send, Loader2 } from "lucide-react";

interface ConfirmacionEnvioModalProps {
  cotizacionId: number;
  emailPredeterminado?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmacionEnvioModal: React.FC<ConfirmacionEnvioModalProps> = ({
  cotizacionId,
  emailPredeterminado = "",
  isOpen,
  onClose,
}) => {
  // Pasamos el cotizacionId al invocar el hook
  const { mutate: enviarCotizacion, isPending } = useEnviarCotizacion(cotizacionId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnviarCotizacionFormData>({
    resolver: zodResolver(enviarCotizacionSchema),
    defaultValues: {
      correoDestinatario: emailPredeterminado,
      asunto: `Cotización #${cotizacionId}`,
      mensaje: "Estimado cliente, adjunto la cotización solicitada.",
      incluirDetalles: true,
    },
  });

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<EnviarCotizacionFormData> = (data) => {
    enviarCotizacion(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold text-foreground">Enviar Cotización</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {/* Correo Destinatario */}
          <div>
            <label className="block text-sm font-medium text-foreground">
              Correo del Destinatario
            </label>
            <Controller
              name="correoDestinatario"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className="mt-1 block w-full rounded-md border border-border p-2 text-sm shadow-sm focus:border-accent focus:outline-none"
                />
              )}
            />
            {errors.correoDestinatario && (
              <p className="mt-1 text-xs text-destructive">{errors.correoDestinatario.message}</p>
            )}
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-foreground">Asunto</label>
            <Controller
              name="asunto"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-border p-2 text-sm shadow-sm focus:border-accent focus:outline-none"
                />
              )}
            />
            {errors.asunto && (
              <p className="mt-1 text-xs text-destructive">{errors.asunto.message}</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-foreground">Mensaje</label>
            <Controller
              name="mensaje"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-border p-2 text-sm shadow-sm focus:border-accent focus:outline-none"
                />
              )}
            />
            {errors.mensaje && (
              <p className="mt-1 text-xs text-destructive">{errors.mensaje.message}</p>
            )}
          </div>

          {/* Checkbox Incluir Detalles */}
          <div className="flex items-center gap-2">
            <Controller
              name="incluirDetalles"
              control={control}
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <input
                  {...fieldProps}
                  type="checkbox"
                  id="incluirDetalles"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              )}
            />
            <label htmlFor="incluirDetalles" className="text-sm text-foreground">
              Incluir desglose de detalles en el correo
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};