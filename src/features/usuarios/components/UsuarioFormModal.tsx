import { useState } from "react"
import type { Rol, UsuarioRequest } from "@/types/usuario"

interface UsuarioFormModalProps {
  roles: Rol[]
  onClose: () => void
  onSubmit: (data: UsuarioRequest) => Promise<void>
}

const vacio: UsuarioRequest = {
  idRol: 0,
  nombreUsuario: "",
  nombres: "",
  correo: "",
  password: "",
}

export function UsuarioFormModal({ roles, onClose, onSubmit }: UsuarioFormModalProps) {
  const [form, setForm] = useState<UsuarioRequest>(vacio)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError("No se pudo crear el usuario. Revisa que el usuario/correo no exista ya.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-3 rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">Nuevo usuario</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre de usuario</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={form.nombreUsuario}
            onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Nombres completos</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={form.nombres}
            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Correo</label>
          <input
            type="email"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Rol</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={form.idRol}
            onChange={(e) => setForm({ ...form, idRol: Number(e.target.value) })}
            required
          >
            <option value={0} disabled>
              Selecciona un rol
            </option>
            {roles.map((rol) => (
              <option key={rol.idRol} value={rol.idRol}>
                {rol.nombreRol}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Contraseña temporal</label>
          <input
            type="password"
            minLength={8}
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  )
}
