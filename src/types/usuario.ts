export interface Rol {
  idRol: number
  nombreRol: string
  descripcion?: string
}

export interface UsuarioResponse {
  idUsuario: number
  nombreUsuario: string
  nombres: string
  correo: string
  nombreRol: string
  bloqueado: boolean
}

export interface UsuarioRequest {
  idRol: number
  nombreUsuario: string
  nombres: string
  correo: string
  password: string
  iniciales: string
}