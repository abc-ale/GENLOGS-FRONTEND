import { axiosClient } from './axiosClient'
import { generarPdf, type LineaPdf } from '@/lib/pdf/documentosPdf'

type Obj = Record<string, unknown>
const num = (v: unknown) => Number(v ?? 0)
const txt = (v: unknown) => (v == null ? '' : String(v))
const fecha = (v: unknown) => {
  if (!v) return ''
  const [y, m, d] = String(v).slice(0, 10).split('-')
  return d && m && y ? `${d}/${m}/${y}` : String(v)
}

function lineasDe(arr: Obj[]): LineaPdf[] {
  return arr.map((l) => ({
    descripcion: txt(l.productoNombre ?? l.servicioNombre ?? l.descripcionPersonalizada ?? 'Ítem'),
    unidad: txt(l.unidadMedida),
    cantidad: num(l.cantidad),
    precioUnitario: num(l.precioUnitario),
    importe: num(l.importeLinea ?? num(l.cantidad) * num(l.precioUnitario)),
  }))
}

async function cargarCotizacion(id: number) {
  const [cot, lineas] = await Promise.all([
    axiosClient.get<Obj>(`/cotizaciones/${id}`).then((r) => r.data),
    axiosClient.get<Obj[]>(`/cotizaciones/${id}/lineas`).then((r) => r.data),
  ])
  return { cot, lineas: lineasDe(lineas) }
}

export async function descargarCotizacionPdf(idCotizacion: number): Promise<void> {
  const { cot, lineas } = await cargarCotizacion(idCotizacion)
  const codigo = txt(cot.codigoCotizacion ?? cot.codigo)
  await generarPdf({
    titulo: 'COTIZACIÓN',
    numero: codigo,
    datos: [
      ['Cliente', txt(cot.clienteRazonSocial ?? cot.clienteNombre)],
      ['Fecha', fecha(cot.fechaCotizacion)],
      ['Válida hasta', fecha(cot.fechaValidez)],
      ['Estado', txt(cot.estado ?? cot.estadoCotizacion)],
    ],
    lineas,
    subtotal: num(cot.subtotal),
    igv: num(cot.igv),
    total: num(cot.total),
    moneda: txt(cot.moneda) || 'PEN',
    observaciones: txt(cot.observaciones) || null,
    nombreArchivo: `Cotizacion-${codigo || idCotizacion}.pdf`,
  })
}

export async function descargarOrdenCompraPdf(idOrdenCompra: number): Promise<void> {
  const oc = (await axiosClient.get<Obj>(`/ordenes-compra/${idOrdenCompra}`)).data
  const { cot, lineas } = await cargarCotizacion(num(oc.idCotizacion))
  const numero = txt(oc.numeroOrdenCompra ?? oc.numero)
  await generarPdf({
    titulo: 'ORDEN DE COMPRA',
    numero,
    datos: [
      ['Cliente', txt(oc.clienteRazonSocial ?? oc.cliente ?? cot.clienteRazonSocial)],
      ['Cotización', txt(oc.codigoCotizacion ?? cot.codigoCotizacion)],
      ['Emisión cliente', fecha(oc.fechaEmisionCliente)],
      ['Recepción', fecha(oc.fechaRecepcion)],
      ['Estado', txt(oc.estado ?? oc.estadoCodigo)],
    ],
    lineas,
    subtotal: num(cot.subtotal),
    igv: num(cot.igv),
    total: num(cot.total),
    moneda: txt(cot.moneda) || 'PEN',
    observaciones: txt(oc.observaciones) || null,
    nombreArchivo: `OrdenCompra-${numero || idOrdenCompra}.pdf`,
  })
}

export async function descargarFacturaPdf(idFacturacion: number): Promise<void> {
  const [fac, det] = await Promise.all([
    axiosClient.get<Obj>(`/facturacion/${idFacturacion}`).then((r) => r.data),
    axiosClient.get<Obj[]>(`/facturacion/${idFacturacion}/detalle`).then((r) => r.data),
  ])
  const lineas = lineasDe(det)
  const subtotal = lineas.reduce((a, l) => a + l.importe, 0)
  const total = num(fac.total) || subtotal * 1.18
  const codigo = txt(fac.codigoComprobante ?? `${txt(fac.serieComprobante)}-${txt(fac.numeroComprobante)}`)
  await generarPdf({
    titulo: txt(fac.tipoComprobante).toUpperCase() || 'FACTURA',
    numero: codigo,
    datos: [
      ['Cliente', txt(fac.clienteRazonSocial ?? fac.cliente)],
      ['Orden de compra', txt(fac.numeroOrdenCompra)],
      ['Emisión', fecha(fac.fechaEmision)],
      ['Vencimiento', fecha(fac.fechaVencimiento)],
      ['Pagado', String(num(fac.montoPagado).toFixed(2))],
      ['Saldo', String(num(fac.saldoPendiente).toFixed(2))],
    ],
    lineas,
    subtotal,
    igv: total - subtotal,
    total,
    moneda: txt(fac.moneda) || 'PEN',
    observaciones: txt(fac.observaciones) || null,
    nombreArchivo: `Factura-${codigo || idFacturacion}.pdf`,
  })
}