import type { AuditFields } from "./common.types"

export const TIPOS_DOCUMENTO = [
  "FICHA_TECNICA",
  "CATALOGO",
  "MANUAL",
  "CERTIFICADO",
  "HOJA_SEGURIDAD",
  "OTRO",
] as const

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number]

export const ETIQUETA_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  FICHA_TECNICA: "Ficha técnica",
  CATALOGO: "Catálogo",
  MANUAL: "Manual",
  CERTIFICADO: "Certificado",
  HOJA_SEGURIDAD: "Hoja de seguridad",
  OTRO: "Otro",
}

export interface CaracteristicaProducto {
  idCaracteristica: number
  nombreCaracteristica: string
  unidadCaracteristica?: string
  valorCaracteristica: string
}

export interface ImagenProducto {
  idProductoImagen: number
  urlImagen: string
  esPrincipal: boolean
}

export interface DocumentoProducto {
  idDocumento: number
  tipoDocumento: TipoDocumento
  nombreDocumento: string
  urlDocumento: string
}

export interface Producto extends AuditFields {
  idProducto: number
  idCategoriaProducto: number
  categoriaNombre?: string
  idMarca?: number
  marcaNombre?: string
  idUnidadMedida: number
  codigoProducto: string
  nombreProducto: string
  procedencia?: string
  stock: number
  visibleWeb: boolean
  descripcion?: string
  caracteristicas: CaracteristicaProducto[]
  imagenes: ImagenProducto[]
  documentos: DocumentoProducto[]
}

export type CaracteristicaRequest = Omit<CaracteristicaProducto, "idCaracteristica">

export interface ProductoRequest {
  idCategoriaProducto: number
  idMarca?: number
  idUnidadMedida: number
  codigoProducto: string
  nombreProducto: string
  procedencia?: string
  stock: number
  visibleWeb: boolean
  descripcion?: string
  caracteristicas?: CaracteristicaRequest[]
}

export interface ProductoFiltros {
  codigo?: string
  nombre?: string
  idCategoriaProducto?: number
  idMarca?: number
  /** Base 0, igual que Spring Data. */
  page?: number
  size?: number
}

/** Imagen ya subida a Cloudinary, pendiente de asociar al producto. */
export interface ImagenNueva {
  url: string
  esPrincipal: boolean
}

/** Documento ya subido a Cloudinary, pendiente de asociar al producto. */
export interface DocumentoNuevo {
  url: string
  nombreDocumento: string
  tipoDocumento: TipoDocumento
}

export interface MediosNuevosProducto {
  imagenes: ImagenNueva[]
  documentos: DocumentoNuevo[]
}
