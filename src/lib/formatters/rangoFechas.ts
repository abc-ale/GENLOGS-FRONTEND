export interface RangoFechas {
  fechaInicio: string
  fechaFin: string
}

/** Formatea en hora LOCAL (toISOString usa UTC y en Perú corre el día tras las 7 p. m.). */
export function aFechaISO(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, "0")
  const d = String(fecha.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function ultimosDias(dias: number, hoy = new Date()): RangoFechas {
  const inicio = new Date(hoy)
  inicio.setDate(inicio.getDate() - dias)
  return { fechaInicio: aFechaISO(inicio), fechaFin: aFechaISO(hoy) }
}

export function mesActual(hoy = new Date()): RangoFechas {
  return {
    fechaInicio: aFechaISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    fechaFin: aFechaISO(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
  }
}

export function trimestreActual(hoy = new Date()): RangoFechas {
  const q = Math.floor(hoy.getMonth() / 3)
  return {
    fechaInicio: aFechaISO(new Date(hoy.getFullYear(), q * 3, 1)),
    fechaFin: aFechaISO(new Date(hoy.getFullYear(), q * 3 + 3, 0)),
  }
}

export function anioActual(hoy = new Date()): RangoFechas {
  return {
    fechaInicio: aFechaISO(new Date(hoy.getFullYear(), 0, 1)),
    fechaFin: aFechaISO(new Date(hoy.getFullYear(), 11, 31)),
  }
}
