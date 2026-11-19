/**
 * Definición de los catálogos maestros (RF-20, CU-14). Cada catálogo usa el mismo
 * patrón del backend: GET/POST en /catalogos/{recurso}, PUT y DELETE (desactivar)
 * en /catalogos/{recurso}/{id}. El backend no valida los campos, por eso las
 * reglas (obligatorio, longitud, formato) se aplican aquí, según las columnas de la BD.
 */

export type TipoCampo = 'texto' | 'entero' | 'slug' | 'categoriaPadre'

export interface CampoCatalogo {
  nombre: string
  etiqueta: string
  tipo: TipoCampo
  requerido?: boolean
  /** Longitud máxima (texto) o valor máximo (entero). */
  max?: number
  /** Valor mínimo (entero). */
  min?: number
  patron?: RegExp
  mensajePatron?: string
  mayusculas?: boolean
  placeholder?: string
  /** Para tipo "slug": campo del que se genera automáticamente. */
  origen?: string
}

export interface CatalogoMaestroDef {
  clave: string
  titulo: string
  singular: string
  /** Género gramatical del singular, para «Nuevo/Nueva» y «registrado/registrada». */
  genero: 'f' | 'm'
  descripcion: string
  recurso: string
  idCampo: string
  campos: CampoCatalogo[]
}

export type RegistroCatalogo = Record<string, unknown> & { status?: string }

export const CATALOGOS_MAESTROS: CatalogoMaestroDef[] = [
  {
    clave: 'monedas',
    titulo: 'Monedas',
    singular: 'moneda',
    genero: 'f',
    descripcion: 'Monedas para cotizaciones, facturación y precios de proveedores.',
    recurso: 'monedas',
    idCampo: 'idMoneda',
    campos: [
      { nombre: 'codigoMoneda', etiqueta: 'Código ISO', tipo: 'texto', requerido: true, max: 3, mayusculas: true, patron: /^[A-Z]{3}$/, mensajePatron: 'El código debe tener 3 letras (por ejemplo, PEN o USD).', placeholder: 'PEN' },
      { nombre: 'nombreMoneda', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 60, placeholder: 'Sol peruano' },
      { nombre: 'simbolo', etiqueta: 'Símbolo', tipo: 'texto', requerido: true, max: 5, placeholder: 'S/' },
    ],
  },
  {
    clave: 'condiciones-pago',
    titulo: 'Condiciones de pago',
    singular: 'condición de pago',
    genero: 'f',
    descripcion: 'Condiciones comerciales y días de crédito usados para calcular vencimientos.',
    recurso: 'condiciones-pago',
    idCampo: 'idCondicionPago',
    campos: [
      { nombre: 'nombreCondicion', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 100, placeholder: 'Crédito 30 días' },
      { nombre: 'diasCredito', etiqueta: 'Días de crédito', tipo: 'entero', requerido: true, min: 0, max: 365, placeholder: '30' },
    ],
  },
  {
    clave: 'unidades-medida',
    titulo: 'Unidades de medida',
    singular: 'unidad de medida',
    genero: 'f',
    descripcion: 'Unidades de los productos y servicios del catálogo.',
    recurso: 'unidades-medida',
    idCampo: 'idUnidadMedida',
    campos: [
      { nombre: 'codigoUnidad', etiqueta: 'Código', tipo: 'texto', requerido: true, max: 10, mayusculas: true, placeholder: 'UND' },
      { nombre: 'nombreUnidad', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 60, placeholder: 'Unidad' },
    ],
  },
  {
    clave: 'sectores-economicos',
    titulo: 'Sectores económicos',
    singular: 'sector económico',
    genero: 'm',
    descripcion: 'Sectores de clientes, productos y servicios.',
    recurso: 'sectores-economicos',
    idCampo: 'idSectorEconomico',
    campos: [
      { nombre: 'nombreSector', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 100, placeholder: 'Minería' },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', max: 255 },
    ],
  },
  {
    clave: 'minerales',
    titulo: 'Minerales',
    singular: 'mineral',
    genero: 'm',
    descripcion: 'Minerales que explotan las empresas mineras de los clientes.',
    recurso: 'minerales',
    idCampo: 'idMineral',
    campos: [
      { nombre: 'nombreMineral', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 60, placeholder: 'Cobre' },
      { nombre: 'simbolo', etiqueta: 'Símbolo químico', tipo: 'texto', max: 5, placeholder: 'Cu' },
    ],
  },
  {
    clave: 'etapas-comerciales',
    titulo: 'Etapas comerciales',
    singular: 'etapa comercial',
    genero: 'f',
    descripcion: 'Etapas del seguimiento comercial de las empresas mineras, en orden de flujo.',
    recurso: 'etapas-comerciales-minera',
    idCampo: 'idEtapaComercial',
    campos: [
      { nombre: 'nombreEtapa', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 60, placeholder: 'Prospección' },
      { nombre: 'ordenFlujo', etiqueta: 'Orden en el flujo', tipo: 'entero', requerido: true, min: 1, max: 999, placeholder: '1' },
    ],
  },
  {
    clave: 'tipos-operacion',
    titulo: 'Tipos de operación minera',
    singular: 'tipo de operación',
    genero: 'm',
    descripcion: 'Tipos de operación de las unidades mineras (tajo abierto, subterránea…).',
    recurso: 'tipos-operacion-minera',
    idCampo: 'idTipoOperacion',
    campos: [
      { nombre: 'nombreOperacion', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 60, placeholder: 'Tajo abierto' },
    ],
  },
  {
    clave: 'categorias-servicio',
    titulo: 'Categorías de servicio',
    singular: 'categoría de servicio',
    genero: 'f',
    descripcion: 'Categorías del catálogo de servicios; pueden tener una categoría padre.',
    recurso: 'categorias-servicio',
    idCampo: 'idCategoriaServicio',
    campos: [
      { nombre: 'nombreCategoria', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 120, placeholder: 'Mantenimiento de bombas' },
      { nombre: 'slugWeb', etiqueta: 'Slug web', tipo: 'slug', requerido: true, max: 150, origen: 'nombreCategoria', patron: /^[a-z0-9]+(-[a-z0-9]+)*$/, mensajePatron: 'Usa solo minúsculas, números y guiones (por ejemplo, mantenimiento-de-bombas).' },
      { nombre: 'categoriaPadre', etiqueta: 'Categoría padre', tipo: 'categoriaPadre' },
    ],
  },
]

/** Convierte un texto en slug para URL: "Mantenimiento de bombas" → "mantenimiento-de-bombas". */
export function generarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150)
}

/** Id de la categoría padre, venga como objeto anidado o como idCategoriaPadre. */
export function idPadreDe(registro: RegistroCatalogo): number | null {
  const padre = registro.categoriaPadre as { idCategoriaServicio?: number } | null | undefined
  const id = padre?.idCategoriaServicio ?? (registro.idCategoriaPadre as number | undefined)
  return typeof id === 'number' ? id : null
}

/** «Nueva moneda» / «Nuevo mineral». */
export function nuevoDe(def: CatalogoMaestroDef): string {
  return `${def.genero === 'f' ? 'Nueva' : 'Nuevo'} ${def.singular}`
}

/** Concuerda un participio con el catálogo: «registrada» / «registrado». */
export function concordar(def: CatalogoMaestroDef, raiz: string): string {
  return `${raiz}${def.genero === 'f' ? 'a' : 'o'}`
}
