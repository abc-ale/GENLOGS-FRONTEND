// src/features/cotizaciones/components/AdjuntoCotizacionUploader.tsx

import React, { useState, useRef } from 'react';
import type { AdjuntoCotizacion } from '@/types/cotizacion.types';
import { formatearTamanioArchivo, formatearFecha } from '@/lib/formatters/codigoCotizacion';
import { useCargarAdjunto, useEliminarAdjunto } from '../hooks/useCotizacionesMutations';
import { Upload, X, File, Download, Loader2 } from 'lucide-react';

interface AdjuntoCotizacionUploaderProps {
  cotizacionId: number;
  adjuntos: AdjuntoCotizacion[];
  readonly?: boolean;
}

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const TAMANIO_MAXIMO = 10 * 1024 * 1024; // 10 MB

export const AdjuntoCotizacionUploader: React.FC<AdjuntoCotizacionUploaderProps> = ({
  cotizacionId,
  adjuntos,
  readonly = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: cargarAdjunto, isPending: isCargarPending } =
    useCargarAdjunto(cotizacionId);
  const { mutate: eliminarAdjunto, isPending: isEliminarPending } =
    useEliminarAdjunto(cotizacionId);
  const [error, setError] = useState<string | null>(null);

  const validarArchivo = (archivo: File): string | null => {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return 'Tipo de archivo no permitido. Solo se aceptan PDF, Word, Excel e imágenes.';
    }
    if (archivo.size > TAMANIO_MAXIMO) {
      return `El archivo es demasiado grande. Máximo: ${formatearTamanioArchivo(TAMANIO_MAXIMO)}`;
    }
    return null;
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (readonly) return;

    const archivos = e.dataTransfer.files;
    if (archivos && archivos.length > 0) {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const errorValidacion = validarArchivo(archivo);

        if (errorValidacion) {
          setError(errorValidacion);
          return;
        }

        cargarAdjunto(archivo);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const archivos = e.target.files;
    if (archivos && archivos.length > 0) {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const errorValidacion = validarArchivo(archivo);

        if (errorValidacion) {
          setError(errorValidacion);
          return;
        }

        cargarAdjunto(archivo);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIconoArchivo = (tipo: string) => {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word')) return '📝';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '📊';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Adjuntos y Documentos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Carga documentos, imágenes o especificaciones relacionadas con la
          cotización
        </p>
      </div>

      {/* Upload Zone */}
      {!readonly && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            dragActive
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-border'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            disabled={isCargarPending}
            className="hidden"
            accept={TIPOS_PERMITIDOS.join(',')}
          />

          <div className="flex justify-center mb-3">
            {isCargarPending ? (
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <p className="text-foreground font-medium mb-1">
            {isCargarPending
              ? 'Cargando archivo...'
              : 'Arrastra archivos aquí o haz clic'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Formatos: PDF, Word, Excel, PNG, JPG • Máximo 10 MB
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCargarPending}
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Upload className="w-4 h-4 mr-2" />
            Seleccionar Archivos
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Lista de adjuntos */}
      {adjuntos.length > 0 ? (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {adjuntos.length} archivo{adjuntos.length !== 1 ? 's' : ''}
          </h3>
          <div className="space-y-2">
            {adjuntos.map((adjunto) => (
              <div
                key={adjunto.id}
                className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg hover:bg-muted transition"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <span className="text-2xl mr-3">
                    {getIconoArchivo(adjunto.tipoArchivo)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {adjunto.nombreArchivo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatearTamanioArchivo(adjunto.tamanio)} •{' '}
                      {formatearFecha(adjunto.fechaSubida || new Date())}
                      {adjunto.subidoPor && ` • Por: ${adjunto.subidoPor}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={adjunto.urlCloudinary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex p-2 text-accent hover:bg-accent/10 rounded-lg transition"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => {
                        if (adjunto.id) {
                          eliminarAdjunto(adjunto.id);
                        }
                      }}
                      disabled={isEliminarPending}
                      className="inline-flex p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                      title="Eliminar"
                    >
                      {isEliminarPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center py-8 bg-muted border border-border rounded-lg">
          <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sin adjuntos</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
        <p className="text-sm text-accent">
          <span className="font-semibold">💡 Consejo:</span> Los adjuntos se
          almacenan en Cloudinary y estarán disponibles cuando se comparta la
          cotización.
        </p>
      </div>
    </div>
  );
};
