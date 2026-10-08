import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Mail, MailCheck } from "lucide-react"
import { solicitarRecuperacion } from "@/api/authApi"
import { IconInput } from "@/components/ui/IconInput"

export function ForgotPasswordPage() {
  const [correo, setCorreo] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await solicitarRecuperacion(correo.trim())
      setEnviado(true)
    } catch {
      setError("No se pudo procesar la solicitud. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
      </div>

      {enviado ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <MailCheck size={24} />
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Ingresa el correo asociado a tu cuenta.</p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Correo</label>
            <IconInput
              icon={<Mail size={16} />}
              type="email"
              autoComplete="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ingrese su correo"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </>
      )}

      <Link
        to="/login"
        className="block text-center text-sm font-medium text-accent hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  )
}
