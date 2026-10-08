// src/lib/formatters/fechaLocal.ts

/**
 * Las fechas sin hora ("2026-09-28") se interpretan como UTC con `new Date()` y en Perú
 * (UTC-5) se mostrarían un día antes. Aquí se tratan como fecha local.
 */
export function parsearFechaLocal(valor: string): Date | null {
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
  const fecha = new Date(soloFecha ? `${valor}T00:00:00` : valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/** dd/mm/aaaa, o `vacio` si no hay fecha válida. */
export function formatearFechaCorta(valor: string | null | undefined, vacio = "—"): string {
  if (!valor) return vacio
  const fecha = parsearFechaLocal(valor)
  if (!fecha) return vacio
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha)
}

/** Fecha de hoy en formato yyyy-mm-dd según la zona horaria del navegador. */
export function hoyISO(): string {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, "0")
  const dia = String(ahora.getDate()).padStart(2, "0")
  return `${ahora.getFullYear()}-${mes}-${dia}`
}