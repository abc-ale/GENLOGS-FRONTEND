import { axiosClient } from "./axiosClient"

export interface Pais { idPais: number; codigoIso: string; nombrePais: string }
export interface Departamento { idDepartamento: number; nombreDepartamento: string }
export interface Provincia { idProvincia: number; nombreProvincia: string }
export interface Distrito { idDistrito: number; nombreDistrito: string }

export const ubigeoApi = {
  paises: () => axiosClient.get<Pais[]>("/paises").then((r) => r.data),
  departamentos: (idPais: number) =>
    axiosClient.get<Departamento[]>("/departamentos", { params: { idPais } }).then((r) => r.data),
  provincias: (idDepartamento: number) =>
    axiosClient.get<Provincia[]>("/provincias", { params: { idDepartamento } }).then((r) => r.data),
  distritos: (idProvincia: number) =>
    axiosClient.get<Distrito[]>("/distritos", { params: { idProvincia } }).then((r) => r.data),
}