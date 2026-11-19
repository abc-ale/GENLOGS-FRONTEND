import axios from "axios"
import { getApiBaseUrl } from "./axiosClient"

/**
 * Cliente sin sesión para el catálogo público (RF-16, CU-12). No usa axiosClient a
 * propósito: aquel adjunta el token y, ante un 401, cierra la sesión y redirige a
 * /login, algo que no debe pasarle a un visitante de la web.
 */
const clientePublico = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60_000,
})

export interface CaracteristicaPublica {
  idCaracteristica: number
  nombreCaracteristica: string
  unidadCaracteristica?: string | null
  valor?: string | null
  valorCaracteristica?: string | null
}

export interface ImagenPublica {
  idProductoImagen: number
  urlImagen: string
  esPrincipal?: boolean
}

export interface DocumentoPublico {
  idDocumento: number
  tipoDocumento: string
  nombreDocumento: string
  urlDocumento: string
}

/** Datos del producto que se muestran en la web (sin stock ni precios). */
export interface ProductoPublico {
  idProducto: number
  codigoProducto: string
  nombreProducto: string
  descripcion?: string | null
  procedencia?: string | null
  categoria?: string | null
  categoriaNombre?: string | null
  marca?: string | null
  marcaNombre?: string | null
  unidadMedida?: string | null
  imagenPrincipal?: string | null
  caracteristicas?: CaracteristicaPublica[]
  imagenes?: ImagenPublica[]
  documentos?: DocumentoPublico[]
}

/** Productos activos marcados como visibles en la web. */
export async function listarCatalogoPublico(): Promise<ProductoPublico[]> {
  const { data } = await clientePublico.get<ProductoPublico[]>("/productos/web")
  return Array.isArray(data) ? data : []
}
