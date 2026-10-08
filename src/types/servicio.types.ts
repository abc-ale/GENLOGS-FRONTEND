// ---- Entidades auxiliares (vienen anidadas dentro de Servicio) ----

export interface UnidadMedida {
  idUnidadMedida: number
  codigoUnidad: string
  nombreUnidad: string
}

export interface SectorEconomico {
  idSectorEconomico: number
  nombreSector: string
  descripcion?: string
}

export interface CategoriaServicio {
  idCategoriaServicio: number
  categoriaPadre?: CategoriaServicio
  nombreCategoria: string
  slugWeb: string
}

// ---- Campos de auditoría que trae TODA entidad (heredan de Auditable) ----

export interface Auditable {
  userCreate: string
  processCreate: string
  dateCreate: string
  userUpdate?: string
  processUpdate?: string
  dateUpdate?: string
  /** 'A' = Activo, 'I' = Inactivo (eliminación lógica) */
  status: "A" | "I"
}

// ---- Entidad principal ----

export interface Servicio extends Auditable {
  idServicio: number
  categoriaServicio: CategoriaServicio
  unidadMedida: UnidadMedida
  codigoServicio: string
  nombreServicio: string
  /** Horas estimadas, puede venir null */
  duracionEstimadaHoras?: number
  visibleWeb: boolean
  descripcion?: string
}

export interface ServicioImagen extends Auditable {
  idServicioImagen: number
  servicio: Servicio
  urlImagen: string
  esPrincipal: boolean
}

// ---- Valores que maneja el formulario (lo que el usuario llena) ----
// Nota: al backend se le manda idCategoriaServicio/idUnidadMedida como
// referencias simples, no el objeto completo anidado.

export interface ServicioFormValues {
  idCategoriaServicio: number
  idUnidadMedida: number
  codigoServicio: string
  nombreServicio: string
  duracionEstimadaHoras?: number
  visibleWeb: boolean
  descripcion?: string
  idsSectores: number[]
}