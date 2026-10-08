export interface Mineral { idMineral: number; nombreMineral: string; simbolo?: string | null; status: 'A' | 'I' }
export interface EtapaComercialMinera { idEtapaComercial: number; nombreEtapa: string; ordenFlujo: number; status: 'A' | 'I' }
export interface TipoOperacionMinera { idTipoOperacion: number; nombreOperacion: string; status: 'A' | 'I' }
export interface EmpresaMineraMineral { idEmpresaMinera: number; idMineral: number; esPrincipal: boolean; mineral?: Mineral; nombre?: string }
export interface EmpresaMinera {
  idEmpresaMinera: number
  id?: number
  idCliente: number
  clienteId?: number
  idEtapaComercial: number
  idTipoOperacion: number
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
  minerales: EmpresaMineraMineral[]
}
export interface EmpresaMineraInput { idCliente: number; idEtapaComercial: number; idTipoOperacion: number; nombreUnidadMinera: string; latitud: number; longitud: number; altitudMsnm?: number | null; capacidadProduccion?: string; descripcion?: string; mineralIds?: number[] }
export interface EmpresaMineraFiltros { idCliente?: number; idMineral?: number; idTipoOperacion?: number; idEtapaComercial?: number; texto?: string }
