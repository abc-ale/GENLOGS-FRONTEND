// src/lib/formatters/codigoCotizacion.ts

/**
 * Genera un código de cotización con formato COT-YYYY-XXXX
 * Donde YYYY es el año actual y XXXX es un número secuencial
 * @param numeroSecuencial - Número secuencial para la cotización
 * @returns Código formateado
 */
export function generarCodigoCotizacion(numeroSecuencial: number): string {
  const año = new Date().getFullYear();
  const numeroFormato = String(numeroSecuencial).padStart(4, '0');
  return `COT-${año}-${numeroFormato}`;
}

/**
 * Formatea una cantidad de dinero con separadores de miles y decimales
 * @param monto - Monto a formatear
 * @param moneda - Moneda (PEN, USD, EUR)
 * @param idioma - Idioma para formato local
 * @returns Monto formateado
 */
export function formatearMoneda(
  monto: number,
  moneda: string = 'PEN',
  idioma: string = 'es-PE'
): string {
  return new Intl.NumberFormat(idioma, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
}

/**
 * Calcula el subtotal de un detalle de cotización
 * @param cantidad - Cantidad de productos
 * @param precioUnitario - Precio unitario
 * @returns Subtotal calculado
 */
export function calcularSubtotal(cantidad: number, precioUnitario: number): number {
  return cantidad * precioUnitario;
}

/**
 * Calcula el total con margen incluido
 * @param subtotal - Subtotal base
 * @param margenPorcentaje - Porcentaje de margen (0-100)
 * @returns Total con margen aplicado
 */
export function calcularTotalConMargen(subtotal: number, margenPorcentaje: number): number {
  const margen = (subtotal * margenPorcentaje) / 100;
  return subtotal + margen;
}

/**
 * Calcula el IGV (Impuesto General a las Ventas) - 18% en Perú
 * @param subtotal - Subtotal antes de IGV
 * @param tasaIGV - Tasa de IGV (por defecto 18%)
 * @returns Monto del IGV
 */
export function calcularIGV(subtotal: number, tasaIGV: number = 0.18): number {
  return subtotal * tasaIGV;
}

/**
 * Calcula el total incluyendo IGV
 * @param subtotal - Subtotal base
 * @param tasaIGV - Tasa de IGV (por defecto 18%)
 * @returns Total con IGV incluido
 */
export function calcularTotalConIGV(subtotal: number, tasaIGV: number = 0.18): number {
  return subtotal + calcularIGV(subtotal, tasaIGV);
}

/**
 * Formatea una fecha al formato local peruano
 * @param fecha - Fecha como string o Date
 * @returns Fecha formateada (ej: 25/09/2026)
 */
export function formatearFecha(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formatea una fecha con hora
 * @param fecha - Fecha como string o Date
 * @returns Fecha y hora formateadas
 */
export function formatearFechaHora(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Mapea estado de cotización a etiqueta legible
 */
export function mapearEstadoCotizacion(estado: string): string {
  const estadosMap: Record<string, string> = {
    BORRADOR: 'Borrador',
    ENVIADA: 'Enviada',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
    CADUCADA: 'Caducada',
  };
  return estadosMap[estado] || estado;
}

/**
 * Retorna el color Tailwind para un estado de cotización
 */
export function colorEstadoCotizacion(estado: string): string {
  const coloresMap: Record<string, string> = {
    BORRADOR: 'bg-muted text-muted-foreground',
    ENVIADA: 'bg-accent/10 text-accent',
    APROBADA: 'bg-success/10 text-success',
    RECHAZADA: 'bg-destructive/10 text-destructive',
    CADUCADA: 'bg-warning/10 text-warning',
  };
  return coloresMap[estado] || 'bg-muted text-muted-foreground';
}

/**
 * Mapea condición de pago a etiqueta legible
 */
export function mapearCondicionPago(condicion: string): string {
  const condicionesMap: Record<string, string> = {
    CONTADO: 'Contado',
    CREDITO_30: 'Crédito 30 días',
    CREDITO_60: 'Crédito 60 días',
  };
  return condicionesMap[condicion] || condicion;
}

/**
 * Formatea el tamaño de archivo en unidades legibles
 * @param bytes - Tamaño en bytes
 * @returns Tamaño formateado
 */
export function formatearTamanioArchivo(bytes: number): string {
  const tamaños = ['B', 'KB', 'MB', 'GB'];
  let indice = 0;
  let tamanio = bytes;

  while (tamanio >= 1024 && indice < tamaños.length - 1) {
    tamanio /= 1024;
    indice++;
  }

  return `${tamanio.toFixed(2)} ${tamaños[indice]}`;
}

/**
 * Valida que un número de RUC sea válido (formato básico)
 */
export function esRUCValido(ruc: string): boolean {
  return /^\d{11}$/.test(ruc.trim());
}
