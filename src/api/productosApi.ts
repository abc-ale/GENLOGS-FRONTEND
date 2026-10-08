import axios from "axios";
import { axiosClient } from "@/api/axiosClient";
import { http } from "./http"
import type {
  DocumentoNuevo,
  ImagenNueva,
  Producto,
  ProductoFiltros,
  ProductoRequest,
} from "@/types/producto.types"
import type { PageResponse } from "@/types/common.types"

/** Quita filtros vacíos para no enviar `?nombre=` al backend. */
function limpiarFiltros(filtros: ProductoFiltros): ProductoFiltros {
  const limpio: ProductoFiltros = {}
  if (filtros.codigo?.trim()) limpio.codigo = filtros.codigo.trim()
  if (filtros.nombre?.trim()) limpio.nombre = filtros.nombre.trim()
  if (filtros.idCategoriaProducto) limpio.idCategoriaProducto = filtros.idCategoriaProducto
  if (filtros.idMarca) limpio.idMarca = filtros.idMarca
  limpio.page = filtros.page ?? 0
  limpio.size = filtros.size ?? 12
  return limpio
}

export async function listarProductos(filtros: ProductoFiltros = {}): Promise<PageResponse<Producto>> {
  const { data } = await http.get<PageResponse<Producto>>("/productos", {
    params: limpiarFiltros(filtros),
  })
  return data
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const { data } = await http.get<Producto>(`/productos/${id}`)
  return data
}

/** Búsqueda puntual por el código único del producto; incluye stock disponible. */
export async function obtenerProductoPorCodigo(codigo: string): Promise<Producto> {
  const { data } = await http.get<Producto>(`/productos/codigo/${encodeURIComponent(codigo.trim())}`)
  return data
}

export async function crearProducto(payload: ProductoRequest): Promise<Producto> {
  const { data } = await axiosClient.post<Producto>("/productos", payload)
  return data
}

export async function actualizarProducto(id: number, payload: ProductoRequest): Promise<Producto> {
  const { data } = await axiosClient.put<Producto>(`/productos/${id}`, payload)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await axiosClient.delete(`/productos/${id}`)
}

export async function agregarImagenProducto(idProducto: number, imagen: ImagenNueva): Promise<void> {
  await axiosClient.post(`/productos/${idProducto}/imagenes`, {
    urlImagen: imagen.url,
    esPrincipal: imagen.esPrincipal,
  })
}

export async function agregarDocumentoProducto(
  idProducto: number,
  documento: DocumentoNuevo
): Promise<void> {
  await axiosClient.post(`/productos/${idProducto}/documentos`, {
    tipoDocumento: documento.tipoDocumento,
    nombreDocumento: documento.nombreDocumento,
    urlDocumento: documento.url,
  })
}

/** Extrae el mensaje de error que devuelve Spring (`message`) o usa uno por defecto. */
export function mensajeErrorApi(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.response?.status === 409) return "La operación entra en conflicto con datos existentes."
    if (error.response?.status === 403) return "No tienes permisos para realizar esta acción."
    if (!error.response) return "Sin conexión con el servidor. Revisa tu red."
  }
  return porDefecto
}
