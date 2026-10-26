export interface Mineral { idMineral: number; nombreMineral: string; simbolo?: string | null; status: 'A' | 'I' }
export interface EtapaComercialMinera { idEtapaComercial: number; nombreEtapa: string; ordenFlujo: number; status: 'A' | 'I' }
export interface TipoOperacionMinera { idTipoOperacion: number; nombreOperacion: string; status: 'A' | 'I' }
export interface EmpresaMineraMineral { idEmpresaMinera: number; idMineral: number; esPrincipal: boolean; mineral?: Mineral; nombre?: string }

/**
 * GET /empresas-mineras no pasa por un DTO: devuelve la entidad JPA tal
 * cual. `cliente`, `etapaComercial` y `tipoOperacion` son relaciones
 * anidadas (objetos), no ids planos — y no trae `minerales` embebido: esa
 * relación vive aparte, en /empresas-mineras/{id}/minerales
 * (EmpresaMineraMineralController).
 */
export interface EmpresaMinera {
  idEmpresaMinera: number
  id?: number
  idCliente?: number
  cliente?: { idCliente: number; tercero?: { razonSocial?: string; nombreComercial?: string | null; numeroDocumento?: string } }
  nombreUnidadMinera: string
  nombre?: string
  latitud: number
  longitud: number
  altitudMsnm?: number | null
  capacidadProduccion?: string | null
  descripcion?: string | null
  status: 'A' | 'I'
  etapaComercial?: EtapaComercialMinera
  tipoOperacion?: TipoOperacionMinera
}
export interface EmpresaMineraInput { idCliente: number; idEtapaComercial: number; idTipoOperacion: number; nombreUnidadMinera: string; latitud: number; longitud: number; altitudMsnm?: number | null; capacidadProduccion?: string; descripcion?: string; mineralIds?: number[] }
export interface EmpresaMineraFiltros { idCliente?: number; idMineral?: number; idTipoOperacion?: number; idEtapaComercial?: number; texto?: string }


