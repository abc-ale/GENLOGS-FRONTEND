import { useState } from "react"
import { Users as UsersIcon } from "lucide-react"
import { UsuarioFormModal } from "./UsuarioFormModal"
import { useUsuarios } from "../hooks/useUsuarios"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows"

export function UsuariosPage() {
  const { usuarios, roles, loading, error, agregar, alternarBloqueo, recargar } = useUsuarios()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [operandoId, setOperandoId] = useState<number | null>(null)
  const [accionError, setAccionError] = useState<string | null>(null)

  async function cambiarBloqueo(idUsuario: number, bloqueado: boolean) {
    setOperandoId(idUsuario)
    setAccionError(null)
    try {
      await alternarBloqueo(idUsuario, bloqueado)
    } catch {
      setAccionError("No se pudo actualizar el estado del usuario.")
    } finally {
      setOperandoId(null)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Registra usuarios, asigna roles y administra el bloqueo de acceso.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void recargar()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Nuevo usuario
          </button>
        </div>
      </header>

      {(error || accionError) && (
        <ErrorBanner message={error || accionError || ""} onRetry={() => void recargar()} />
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 font-medium text-muted-foreground">Usuario</th>
              <th className="p-3 font-medium text-muted-foreground">Nombres</th>
              <th className="p-3 font-medium text-muted-foreground">Correo</th>
              <th className="p-3 font-medium text-muted-foreground">Rol</th>
              <th className="p-3 font-medium text-muted-foreground">Estado</th>
              <th className="p-3 text-right font-medium text-muted-foreground">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading && <TableSkeletonRows columns={6} />}
            {!loading && !error && usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                  <UsersIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No hay usuarios registrados. Usa "Nuevo usuario" para crear el primero.
                </td>
              </tr>
            )}
            {!loading && usuarios.map((usuario) => (
              <tr key={usuario.idUsuario} className="border-t border-border hover:bg-muted/50">
                <td className="p-3 font-medium text-foreground">{usuario.nombreUsuario}</td>
                <td className="p-3">{usuario.nombres}</td>
                <td className="p-3">{usuario.correo}</td>
                <td className="p-3">{usuario.nombreRol}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${usuario.bloqueado ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                    {usuario.bloqueado ? "Bloqueado" : "Activo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    disabled={operandoId === usuario.idUsuario}
                    onClick={() => void cambiarBloqueo(usuario.idUsuario, usuario.bloqueado)}
                    className="text-sm font-medium text-accent hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {operandoId === usuario.idUsuario ? "Guardando…" : usuario.bloqueado ? "Desbloquear" : "Bloquear"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {mostrarFormulario && (
        <UsuarioFormModal
          roles={roles}
          onClose={() => setMostrarFormulario(false)}
          onSubmit={async (data) => {
            await agregar(data)
            setMostrarFormulario(false)
          }}
        />
      )}
    </section>
  )
}
