// src/features/cotizaciones/pages/CotizacionDetallePage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCotizacion } from '../hooks/useCotizaciones';
import { useCambiarEstado } from '../hooks/useCambiarEstado';
import { useDescargarPDF } from '../hooks/useCotizacionesMutations';
import { useOrdenesCompra } from '@/features/ordenes-compra/hooks/useOrdenesCompra';
import { useFacturas } from '@/features/facturacion/hooks/useFacturacion';
import { SeguimientoTimeline } from '../components/SeguimientoTimeline';
import { AdjuntoCotizacionUploader } from '../components/AdjuntoCotizacionUploader';
import { ConfirmacionEnvioModal } from '../components/ConfirmacionEnvioModal';
import { PipelineBreadcrumb, type PipelineStep } from '@/components/ui/PipelineBreadcrumb';
import { EstadoCotizacion } from '@/types/cotizacion.types';
import {
  formatearMoneda,
  mapearEstadoCotizacion,
  formatearFecha,
  colorEstadoCotizacion,
  mapearCondicionPago,
} from '@/lib/formatters/codigoCotizacion';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  Download,
  Edit,
} from 'lucide-react';

export const CotizacionDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cotizacionId = id ? Number(id) : null;

  const { data: cotizacion, isLoading, error } = useCotizacion(cotizacionId);
  const { mutate: cambiarEstado, isPending: isChangingState } =
    useCambiarEstado(cotizacionId || 0);
  const { mutate: descargarPDF, isPending: isDownloadingPDF } =
    useDescargarPDF(cotizacionId || 0);

  // Para el breadcrumb "Cotización → Orden de Compra → Factura": se busca si
  // ya existe una orden generada a partir de esta cotización, y si esa orden
  // ya tiene una factura. Aún no hay pantallas de detalle para Orden/Factura,
  // así que solo se enlaza lo que ya se puede abrir (la cotización misma);
  // los otros pasos se muestran como estado, no como link, hasta que existan.
  const { data: ordenesData } = useOrdenesCompra();
  const ordenGenerada = ordenesData?.content?.find((o) => o.idCotizacion === cotizacionId);
  const { data: facturasData } = useFacturas();
  const facturaGenerada = facturasData?.content?.find(
    (f) => f.idOrdenCompra === ordenGenerada?.idOrdenCompra
  );
  const [showEnvioModal, setShowEnvioModal] = useState(false);
  const [showEstadoSelector, setShowEstadoSelector] = useState(false);

  const handleCambiarEstado = (nuevoEstado: EstadoCotizacion) => {
    cambiarEstado(
      {
        estadoNuevo: nuevoEstado,
        observaciones: '',
      },
      {
        onSuccess: () => {
          setShowEstadoSelector(false);
        },
      }
    );
  };

  if (!cotizacionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">
            ID de cotización inválido
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !cotizacion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">
            Error al cargar la cotización
          </p>
          <button
            onClick={() => navigate('/cotizaciones')}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const calcularTotales = () => {
    let subtotal = 0;
    cotizacion.detalles?.forEach((detalle) => {
      subtotal += detalle.subtotal || 0;
    });
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  const totales = calcularTotales();

  const pasosPipeline: PipelineStep[] = [
    { label: `Cotización ${cotizacion.codigo}`, status: 'current' },
    {
      label: ordenGenerada ? `Orden ${ordenGenerada.numeroOrdenCompra}` : 'Orden de compra',
      status: ordenGenerada ? 'completed' : 'pending',
      href: ordenGenerada ? '/ordenes-compra' : undefined,
    },
    {
      label: facturaGenerada ? `Factura ${facturaGenerada.codigoComprobante}` : 'Facturación',
      status: facturaGenerada ? 'completed' : 'pending',
      href: facturaGenerada ? '/facturacion' : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb del pipeline de negocio */}
        <div className="mb-4">
          <PipelineBreadcrumb steps={pasosPipeline} />
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cotizaciones')}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {cotizacion.codigo}
              </h1>
              <p className="text-muted-foreground mt-1">
                Cliente: {cotizacion.clienteNombre}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/cotizaciones/${cotizacion.id}/editar`)}
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estado actual</p>
              <span
                className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${colorEstadoCotizacion(
                  cotizacion.estadoCotizacion
                )}`}
              >
                {mapearEstadoCotizacion(cotizacion.estadoCotizacion)}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowEstadoSelector(!showEstadoSelector)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted transition font-medium text-sm"
              >
                Cambiar estado
              </button>

              {showEstadoSelector && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-10 min-w-48">
                  {Object.values(EstadoCotizacion).map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      disabled={isChangingState}
                      className={`w-full text-left px-4 py-2 hover:bg-muted first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 transition ${
                        cotizacion.estadoCotizacion === estado
                          ? 'bg-accent/10 text-accent font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      {mapearEstadoCotizacion(estado)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEnvioModal(true)}
                className="inline-flex items-center px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </button>
              <button
                onClick={() => descargarPDF()}
                disabled={isDownloadingPDF}
                className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 disabled:opacity-50 transition font-medium text-sm"
              >
                {isDownloadingPDF ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Información General
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="text-foreground font-medium">
                    {cotizacion.clienteNombre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cotizacion.clienteEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condición de Pago</p>
                  <p className="text-foreground font-medium">
                    {mapearCondicionPago(cotizacion.condicionPago)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moneda</p>
                  <p className="text-foreground font-medium">
                    {cotizacion.moneda}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="text-foreground font-medium">
                    {formatearFecha(cotizacion.fechaCreacion || '')}
                  </p>
                </div>
              </div>

              {cotizacion.observaciones && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Observaciones</p>
                  <p className="text-foreground">{cotizacion.observaciones}</p>
                </div>
              )}
            </div>

            {/* Detalles */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Detalles de Cotización
              </h2>
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
                      <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizacion.detalles?.map((detalle, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="px-4 py-3 text-foreground">
                          {detalle.producto || detalle.servicio}
                        </td>
                        <td className="px-4 py-3 text-center text-foreground">
                          {detalle.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {formatearMoneda(
                            detalle.precioUnitario,
                            cotizacion.moneda
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {formatearMoneda(
                            detalle.subtotal,
                            cotizacion.moneda
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline */}
            <SeguimientoTimeline
              seguimientos={cotizacion.seguimientos}
              estadoActual={cotizacion.estadoCotizacion}
            />

            {/* Adjuntos */}
            <AdjuntoCotizacionUploader
              cotizacionId={cotizacion.id || 0}
              adjuntos={cotizacion.adjuntos || []}
              readonly={cotizacion.estadoCotizacion !== EstadoCotizacion.BORRADOR}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Totales */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Resumen Financiero
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-foreground">Subtotal:</span>
                  <span className="font-semibold text-foreground">
                    {formatearMoneda(totales.subtotal, cotizacion.moneda)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-foreground">IGV (18%):</span>
                  <span className="font-semibold text-foreground">
                    {formatearMoneda(totales.igv, cotizacion.moneda)}
                  </span>
                </div>
                <div className="flex justify-between py-3 px-3 rounded-lg bg-accent/10">
                  <span className="font-bold text-foreground">Total:</span>
                  <span className="font-bold text-accent text-lg">
                    {formatearMoneda(totales.total, cotizacion.moneda)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Detalles</h3>
              <div>
                <p className="text-sm text-muted-foreground">Líneas</p>
                <p className="text-2xl font-bold text-foreground">
                  {cotizacion.detalles?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adjuntos</p>
                <p className="text-2xl font-bold text-foreground">
                  {cotizacion.adjuntos?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Historial</p>
                <p className="text-2xl font-bold text-foreground">
                  {cotizacion.seguimientos?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Envio Modal */}
      <ConfirmacionEnvioModal
        isOpen={showEnvioModal}
        onClose={() => setShowEnvioModal(false)}
        cotizacionId={cotizacion.id || 0}
        emailPredeterminado={cotizacion.clienteEmail}
      />
    </div>
  );
};