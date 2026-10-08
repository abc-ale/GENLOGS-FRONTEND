import { useEffect, useState, useCallback } from "react"
import { listarUsuarios, crearUsuario, cambiarBloqueoUsuario } from "@/api/usuariosApi"
import { listarRoles } from "@/api/rolesApi"
import type { UsuarioRequest, UsuarioResponse, Rol } from "@/types/usuario"

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usuariosData, rolesData] = await Promise.all([listarUsuarios(), listarRoles()])
      setUsuarios(usuariosData)
      setRoles(rolesData)
    } catch {
      setError("No se pudo cargar la lista de usuarios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    async function cargarInicial() {
      try {
        const [usuariosData, rolesData] = await Promise.all([listarUsuarios(), listarRoles()])
        if (cancelado) return
        setUsuarios(usuariosData)
        setRoles(rolesData)
      } catch {
        if (!cancelado) setError("No se pudo cargar la lista de usuarios")
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarInicial()
    return () => {
      cancelado = true
    }
  }, [])

  async function agregar(data: UsuarioRequest) {
    const nuevo = await crearUsuario(data)
    setUsuarios((prev) => [...prev, nuevo])
  }

  async function alternarBloqueo(idUsuario: number, bloqueadoActual: boolean) {
    const actualizado = await cambiarBloqueoUsuario(idUsuario, !bloqueadoActual)
    setUsuarios((prev) => prev.map((u) => (u.idUsuario === idUsuario ? actualizado : u)))
  }

  return { usuarios, roles, loading, error, agregar, alternarBloqueo, recargar: cargar }
}