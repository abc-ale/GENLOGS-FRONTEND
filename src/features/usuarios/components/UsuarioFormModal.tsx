import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { consultarDocumento } from "@/api/usuariosApi"
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
  iniciales: "",
}

export function UsuarioFormModal({ roles, onClose, onSubmit }: UsuarioFormModalProps) {
  const [form, setForm] = useState<UsuarioRequest>(vacio)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [documento, setDocumento] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [docMsg, setDocMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  const docValido = documento.length === 8 || documento.length === 11

  function generarUsuario(nombres: string, apPaterno: string) {
    const quitar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "")
    return (quitar(nombres.split(" ")[0] ?? "").charAt(0) + quitar(apPaterno)).slice(0, 50)
  }

  async function buscarDocumento(numero: string) {
    setBuscando(true)
    setDocMsg(null)
    try {
      const r = await consultarDocumento(numero)
      const completo = r.razonSocial ?? ""
      const nombre = r.nombres ?? ""
      const ap = r.apellidoPaterno ?? ""
      const ini = r.tipoDocumento === "DNI"
        ? ((nombre[0] ?? "") + (ap[0] ?? "") + (r.apellidoMaterno?.[0] ?? "")).toUpperCase()
        : completo.split(/\s+/).slice(0, 3).map((p) => p[0]).join("").toUpperCase()
      setForm((f) => ({
        ...f,
        nombres: completo,
        iniciales: ini.slice(0, 3),
        nombreUsuario: f.nombreUsuario || (r.tipoDocumento === "DNI" ? generarUsuario(nombre, ap) : ""),
      }))
      setDocMsg({ ok: true, texto: `${r.tipoDocumento} encontrado${r.simulado ? " (datos simulados: falta FACTILIZA_API_KEY)" : ""}` })
    } catch {
      setDocMsg({ ok: false, texto: "No se encontró el documento. Verifica el número." })
    } finally {
      setBuscando(false)
    }
  }

  function onDocumentoChange(valor: string) {
    const limpio = valor.replace(/\D/g, "").slice(0, 11)
    setDocumento(limpio)
    setDocMsg(null)
    if (limpio.length === 8 || limpio.length === 11) void buscarDocumento(limpio)
  }

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
          <label className="text-sm font-medium">DNI o RUC</label>
          <div className="relative">
            <input
              inputMode="numeric"
              placeholder="8 dígitos (DNI) u 11 dígitos (RUC)"
              className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
              value={documento}
              onChange={(e) => onDocumentoChange(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </span>
          </div>
          {documento.length > 0 && !docValido && (
            <p className="text-xs text-muted-foreground">Ingresa 8 dígitos (DNI) o 11 (RUC).</p>
          )}
          {docMsg && (
            <p className={`text-xs ${docMsg.ok ? "text-success" : "text-destructive"}`}>{docMsg.texto}</p>
          )}
        </div>

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
            readOnly={docValido && !!form.nombres}
            className="w-full rounded-md border bg-muted/40 px-3 py-2 text-sm"
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
          <label className="text-sm font-medium">Iniciales (máx. 3)</label>
          <input
            maxLength={3}
            className="w-full rounded-md border px-3 py-2 text-sm uppercase"
            value={form.iniciales}
            onChange={(e) => setForm({ ...form, iniciales: e.target.value.toUpperCase() })}
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