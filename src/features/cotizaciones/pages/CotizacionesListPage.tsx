// src/features/cotizaciones/pages/CotizacionesListPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCotizaciones } from '../hooks/useCotizaciones';
import { useDuplicarCotizacion } from '../hooks/useCotizacionesMutations';
import {
  EstadoCotizacion,
  Moneda,
  type CotizacionesFilterParams,
} from '@/types/cotizacion.types';
import {
  formatearMoneda,
  mapearEstadoCotizacion,
  formatearFecha,
  colorEstadoCotizacion,
} from '@/lib/formatters/codigoCotizacion';
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

export const CotizacionesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<CotizacionesFilterParams>({
    page: 0,
    size: 10,
    sortBy: 'fechaCreacion',
    sortDir: 'DESC',
  });

  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, error } = useCotizaciones(filtros);
  const { mutate: duplicarCotizacion, isPending: isDuplicarPending } =
    useDuplicarCotizacion();

  const handleFilterChange = (newFiltros: Partial<CotizacionesFilterParams>) => {
    setFiltros((prev) => ({
      ...prev,
      ...newFiltros,
      page: 0, // Reset a primera página al cambiar filtros
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFiltros((prev) => ({ ...prev, page: newPage }));
  };

  const handleDuplicar = (id: number) => {
    duplicarCotizacion(id, {
      onSuccess: (data) => {
        // La pantalla de edición (/cotizaciones/:id/editar) no existe todavía;
        // se abre el detalle de la cotización recién duplicada, donde sí se
        // puede gestionar su estado y descargar el PDF.
        navigate(`/cotizaciones/${data.id}`);
      },
    });
  };
  const paginaActual = filtros.page ?? 0;
  const totalPaginas = data?.totalPages ?? 0;
  const paginasVisibles: Array<number | "ellipsis-start" | "ellipsis-end"> = [];

  if (totalPaginas <= 5) {
    paginasVisibles.push(...Array.from({ length: totalPaginas }, (_, i) => i));
  } else {
    const inicio = Math.max(1, paginaActual - 1);
    const fin = Math.min(totalPaginas - 2, paginaActual + 1);
    paginasVisibles.push(0);
    if (inicio > 1) paginasVisibles.push("ellipsis-start");
    for (let pagina = inicio; pagina <= fin; pagina += 1) paginasVisibles.push(pagina);
    if (fin < totalPaginas - 2) paginasVisibles.push("ellipsis-end");
    paginasVisibles.push(totalPaginas - 1);
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cotizaciones</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tus cotizaciones y seguimiento de clientes
              </p>
            </div>
            <button
              onClick={() => navigate('/cotizaciones/nueva')}
              className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Cotización
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-foreground hover:text-foreground font-medium"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros {filtros.estadoCotizacion && '(1)'}
          </button>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado
                </label>
                <select
                  value={filtros.estadoCotizacion || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      estadoCotizacion: (e.target.value as EstadoCotizacion) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                >
                  <option value="">Todos los estados</option>
                  {Object.values(EstadoCotizacion).map((estado) => (
                    <option key={estado} value={estado}>
                      {mapearEstadoCotizacion(estado)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Moneda
                </label>
                <select
                  value={filtros.moneda || ''}
                  onChange={(e) =>
                    handleFilterChange({ moneda: (e.target.value as Moneda) || undefined })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                >
                  <option value="">Todas las monedas</option>
                  {Object.values(Moneda).map((moneda) => (
                    <option key={moneda} value={moneda}>
                      {moneda}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ordenar por
                </label>
                <select
                  value={filtros.sortDir || 'DESC'}
                  onChange={(e) =>
                    handleFilterChange({
                      sortDir: (e.target.value as 'ASC' | 'DESC'),
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                >
                  <option value="DESC">Más recientes</option>
                  <option value="ASC">Más antiguos</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">
                Error al cargar cotizaciones
              </h3>
              <p className="text-destructive">
                {error instanceof Error ? error.message : 'Intenta recargar la página'}
              </p>
            </div>
          </div>
        ) : data && data.content.length > 0 ? (
          <>
            {/* Table */}
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right font-semibold text-foreground">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((cotizacion) => (
                      <tr
                        key={cotizacion.id}
                        className="border-b border-border hover:bg-muted transition"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-foreground">
                            {cotizacion.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {cotizacion.clienteNombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cotizacion.clienteEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorEstadoCotizacion(
                              cotizacion.estadoCotizacion
                            )}`}
                          >
                            {mapearEstadoCotizacion(
                              cotizacion.estadoCotizacion
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-foreground">
                          {formatearMoneda(cotizacion.total, cotizacion.moneda)}
                        </td>
                        <td className="px-6 py-4 text-center text-muted-foreground">
                          {formatearFecha(cotizacion.fechaCreacion || '')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/cotizaciones/${cotizacion.id}`)
                              }
                              className="p-2 text-accent hover:bg-accent/10 rounded-lg transition"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicar(cotizacion.id!)}
                              disabled={isDuplicarPending}
                              className="p-2 text-success hover:bg-success/10 disabled:opacity-50 rounded-lg transition"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Paginación compacta */}
            {data.totalPages > 1 && (
              <div className="mt-6 flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Página {paginaActual + 1} de {data.totalPages}
                  <span className="hidden sm:inline"> · Mostrando {data.content.length} de {data.totalElements} cotizaciones</span>
                </p>
                <nav aria-label="Paginación de cotizaciones" className="flex items-center justify-center gap-1">
                  <button onClick={() => handlePageChange(paginaActual - 1)} disabled={paginaActual === 0} aria-label="Página anterior" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {paginasVisibles.map((pagina, index) => typeof pagina === "number" ? (
                    <button key={pagina} onClick={() => handlePageChange(pagina)} aria-current={paginaActual === pagina ? "page" : undefined} aria-label={`Página ${pagina + 1}`} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${paginaActual === pagina ? "bg-accent text-white shadow-sm" : "border border-border text-foreground hover:bg-muted"}`}>
                      {pagina + 1}
                    </button>
                  ) : (
                    <span key={`${pagina}-${index}`} aria-hidden="true" className="w-7 text-center text-sm text-muted-foreground">…</span>
                  ))}
                  <button onClick={() => handlePageChange(paginaActual + 1)} disabled={paginaActual >= data.totalPages - 1} aria-label="Página siguiente" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin cotizaciones
            </h3>
            <p className="text-muted-foreground mb-6">
              No hay cotizaciones disponibles con los filtros seleccionados
            </p>
            <button
              onClick={() => navigate('/cotizaciones/nueva')}
              className="inline-flex items-center px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Cotización
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
