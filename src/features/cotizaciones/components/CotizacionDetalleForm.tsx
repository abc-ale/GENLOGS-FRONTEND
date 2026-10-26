import React, { useCallback, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { listarServicios } from '@/api/serviciosApi';
import { obtenerProductoPorCodigo } from '@/api/productosApi';
import type { Producto } from '@/types/producto.types';
import { useProductos } from '@/hooks/useProductos';
import type { CrearCotizacionFormData } from '@/lib/validators/cotizacion.schema';
import { formatearMoneda, calcularSubtotal, calcularTotalConMargen } from '@/lib/formatters/codigoCotizacion';
import { Plus, Search, Trash2 } from 'lucide-react';

interface Props { moneda: string }
type TipoItem = 'producto' | 'servicio';

export const CotizacionDetalleForm: React.FC<Props> = ({ moneda }) => {
  const { control, watch, setValue, formState: { errors } } = useFormContext<CrearCotizacionFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });
  const detalles = watch('detalles');
  const agregarDetalle = useCallback(() => append({ cantidad: 1, precioUnitario: 0, margenPorcentaje: 0, subtotal: 0 }), [append]);
  const subtotalGeneral = (detalles ?? []).reduce((sum, item) => sum + calcularSubtotal(item.cantidad || 0, item.precioUnitario || 0), 0);
  const igv = subtotalGeneral * 0.18;
  const sobreStock = (detalles ?? []).some((item) => item.idProducto && item.stockDisponible !== undefined && item.cantidad > item.stockDisponible);

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold text-foreground">Productos y servicios</h2><p className="mt-1 text-sm text-muted-foreground">Busca en el catálogo y revisa el stock antes de agregar.</p></div>
        <button type="button" onClick={agregarDetalle} className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent/90"><Plus className="mr-2 h-4 w-4"/>Agregar ítem</button>
      </header>
      {errors.detalles?.message && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errors.detalles.message}</p>}
      {sobreStock && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800">La cantidad solicitada supera el stock disponible. Ajusta la cantidad para continuar.</p>}
      {fields.length === 0 ? <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">Aún no agregaste productos o servicios.</div> : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <DetalleRow key={field.id} index={index} moneda={moneda} onRemove={() => remove(index)} onSelect={(item) => {
              setValue(`detalles.${index}.idProducto`, item.tipo === 'producto' ? item.id : undefined, { shouldValidate: true });
              setValue(`detalles.${index}.idServicio`, item.tipo === 'servicio' ? item.id : undefined, { shouldValidate: true });
              setValue(`detalles.${index}.idUnidadMedida`, item.unidadId, { shouldValidate: true });
              setValue(`detalles.${index}.producto`, item.tipo === 'producto' ? item.nombre : undefined);
              setValue(`detalles.${index}.servicio`, item.tipo === 'servicio' ? item.nombre : undefined);
              setValue(`detalles.${index}.stockDisponible`, item.tipo === 'producto' ? item.stock : undefined, { shouldValidate: true });
              setValue(`detalles.${index}.precioUnitario`, item.precio, { shouldValidate: true });
              setValue(`detalles.${index}.descripcion`, item.nombre);
            }} />
          ))}
        </div>
      )}
      {fields.length > 0 && <div className="flex justify-end border-t border-border pt-5"><div className="w-full space-y-3 sm:w-80">
        <div className="flex justify-between"><span>Subtotal</span><strong>{formatearMoneda(subtotalGeneral, moneda)}</strong></div>
        <div className="flex justify-between"><span>IGV (18%)</span><strong>{formatearMoneda(igv, moneda)}</strong></div>
        <div className="flex justify-between rounded-xl bg-muted p-3 text-lg"><strong>Total</strong><strong className="text-accent">{formatearMoneda(subtotalGeneral + igv, moneda)}</strong></div>
      </div></div>}
    </section>
  );
};

interface ItemSeleccionado { tipo: TipoItem; id: number; nombre: string; unidadId: number; unidad: string; stock?: number; precio: number }
interface RowProps { index: number; moneda: string; onRemove: () => void; onSelect: (item: ItemSeleccionado) => void }
const DetalleRow: React.FC<RowProps> = ({ index, moneda, onRemove, onSelect }) => {
  const { register, watch, setValue } = useFormContext<CrearCotizacionFormData>();
  const [tipo, setTipo] = useState<TipoItem>('producto');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<ItemSeleccionado | null>(null);
  const detalle = watch(`detalles.${index}`);
  const query = busqueda.trim();
  const { data: productosPage, isFetching: buscandoNombre } = useProductos({ nombre: query, page: 0, size: 8 });
  const { data: productoPorCodigo, isFetching: buscandoCodigo } = useQuery({ queryKey: ['producto-codigo', query], queryFn: () => obtenerProductoPorCodigo(query).catch(() => null), enabled: tipo === 'producto' && query.length >= 2, staleTime: 30_000 });
  const { data: servicios = [], isFetching: cargandoServicios } = useQuery({ queryKey: ['servicios', 'cotizacion', query], queryFn: () => listarServicios({ soloActivos: true }), enabled: tipo === 'servicio' && query.length >= 2, staleTime: 30_000 });
  const productosEncontrados: Producto[] = [...(productoPorCodigo ? [productoPorCodigo] : []), ...(productosPage?.content ?? [])];
  const productosUnicos = productosEncontrados.filter((producto, index, lista) => lista.findIndex((item) => item.idProducto === producto.idProducto) === index);
  const opciones: ItemSeleccionado[] = tipo === 'producto'
    ? productosUnicos.filter((p) => `${p.nombreProducto} ${p.codigoProducto}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(0, 8).map((p) => ({ tipo, id: p.idProducto, nombre: p.nombreProducto, unidadId: p.idUnidadMedida, unidad: p.unidadMedida ?? 'Unidad', stock: Number(p.stock) || 0, precio: 0 }))
    : servicios.filter((s) => `${s.nombreServicio} ${s.codigoServicio}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(0, 8).map((s) => ({ tipo, id: s.idServicio, nombre: s.nombreServicio, unidadId: s.unidadMedida.idUnidadMedida, unidad: s.unidadMedida.nombreUnidad, precio: 0 }));
  const subtotal = calcularSubtotal(detalle?.cantidad ?? 0, detalle?.precioUnitario ?? 0);
  const stockError = Boolean(detalle?.idProducto && detalle.stockDisponible !== undefined && detalle.cantidad > detalle.stockDisponible);
  const loading = tipo === 'producto' ? buscandoNombre || buscandoCodigo : cargandoServicios;

  return <article className="rounded-xl border border-border bg-background p-4 shadow-sm">
    <div className="mb-3 flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2">
      {(['producto', 'servicio'] as const).map((opcion) => <button key={opcion} type="button" onClick={() => { setTipo(opcion); setBusqueda(''); setSeleccion(null); setValue(`detalles.${index}.idProducto`, undefined); setValue(`detalles.${index}.idServicio`, undefined); setValue(`detalles.${index}.stockDisponible`, undefined); }} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tipo === opcion ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>{opcion}</button>)}
    </div><button type="button" onClick={onRemove} aria-label="Eliminar ítem" className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></button></div>
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium">Buscar {tipo}</label>
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setAbierto(true); setSeleccion(null); }} onFocus={() => setAbierto(true)} onBlur={() => window.setTimeout(() => setAbierto(false), 150)} placeholder={tipo === 'producto' ? 'Escribe el nombre del producto' : 'Código o nombre del servicio'} className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"/>
      {abierto && busqueda.trim().length >= 2 && <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-card shadow-xl">
        {loading ? <p className="p-3 text-sm text-muted-foreground">Buscando en el catálogo…</p> : opciones.length ? opciones.map((item) => <button type="button" key={`${item.tipo}-${item.id}`} onMouseDown={(e) => e.preventDefault()} onClick={() => { setSeleccion(item); setBusqueda(item.nombre); setAbierto(false); onSelect(item); }} className="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-muted"><span><span className="block font-medium">{item.nombre}</span><span className="text-xs text-muted-foreground">{item.unidad}{item.tipo === 'producto' ? ` · Stock: ${item.stock}` : ''}</span></span><span className="shrink-0 text-xs font-semibold text-accent">{item.tipo === 'producto' ? `Stock ${item.stock}` : 'Servicio'}</span></button>) : <p className="p-3 text-sm text-muted-foreground">No se encontraron coincidencias.</p>}
      </div>}</div>
      {seleccion && <p className={`mt-1.5 text-xs ${seleccion.tipo === 'producto' && (seleccion.stock ?? 0) <= 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{seleccion.tipo === 'producto' ? `Disponible: ${seleccion.stock} ${seleccion.unidad}` : `Unidad: ${seleccion.unidad}`}</p>}
      {!seleccion && detalle?.idProducto && <p className="mt-1.5 text-xs text-muted-foreground">Stock disponible: {detalle.stockDisponible ?? 0}</p>}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <label className="text-sm">Cantidad<input {...register(`detalles.${index}.cantidad`, { valueAsNumber: true })} type="number" min="1" step="1" className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 ${stockError ? 'border-destructive' : 'border-border'}`}/>{stockError && <span role="alert" className="mt-1 block text-xs text-destructive">Supera el stock ({detalle.stockDisponible}).</span>}</label>
      <label className="text-sm">Precio unit.<input {...register(`detalles.${index}.precioUnitario`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"/></label>
      <label className="text-sm">Margen %<input {...register(`detalles.${index}.margenPorcentaje`, { valueAsNumber: true })} type="number" min="0" max="100" step="0.1" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"/></label>
      <div className="text-sm">Importe<div className="mt-1 rounded-lg bg-muted px-3 py-2 font-semibold">{formatearMoneda(calcularTotalConMargen(subtotal, detalle?.margenPorcentaje ?? 0), moneda)}</div></div>
    </div>
    <input type="hidden" {...register(`detalles.${index}.idProducto`)} /><input type="hidden" {...register(`detalles.${index}.idServicio`)} /><input type="hidden" {...register(`detalles.${index}.idUnidadMedida`)} />
  </article>;
};







