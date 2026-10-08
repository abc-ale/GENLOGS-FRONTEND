import { useEffect, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import { Lock, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { restablecerPassword, validarTokenReset } from "@/api/authApi"
import { PasswordInput } from "@/components/ui/PasswordInput"

type Estado = "validando" | "valido" | "invalido" | "completado"

const linkClass =
  "text-sm font-medium text-accent hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"

const botonClass =
  "w-full rounded-lg bg-linear-to-r from-primary to-accent px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function formatearTiempo(totalSegundos: number): string {
  const min = Math.floor(totalSegundos / 60)
  const seg = totalSegundos % 60
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`
}

function mensajeDeError(error: unknown): { mensaje: string; enlaceInvalido: boolean } {
  if (axios.isAxiosError(error)) {
    const mensaje = (error.response?.data as { message?: string } | undefined)?.message
    if (mensaje) {
      return { mensaje, enlaceInvalido: mensaje.startsWith("El enlace") }
    }
    if (!error.response) {
      return { mensaje: "No se pudo conectar con el servidor. Inténtalo de nuevo.", enlaceInvalido: false }
    }
  }
  return { mensaje: "No se pudo cambiar la contraseña. Inténtalo de nuevo.", enlaceInvalido: false }
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [estado, setEstado] = useState<Estado>(token ? "validando" : "invalido")
  const [segundos, setSegundos] = useState(0)

  const [nuevaPassword, setNuevaPassword] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 1) Al abrir la página se consulta al backend si el enlace sigue vigente.
  useEffect(() => {
    if (!token) return
    let cancelado = false

    validarTokenReset(token)
      .then((info) => {
        if (cancelado) return
        setSegundos(info.segundosRestantes)
        setEstado(info.segundosRestantes > 0 ? "valido" : "invalido")
      })
      .catch(() => {
        if (!cancelado) setEstado("invalido")
      })

    return () => {
      cancelado = true
    }
  }, [token])

  // 2) Cuenta regresiva: al llegar a cero el formulario desaparece.
  useEffect(() => {
    if (estado !== "valido") return
    const id = window.setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          setEstado("invalido")
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [estado])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (nuevaPassword !== confirmacion) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      await restablecerPassword(token, nuevaPassword)
      setEstado("completado")
    } catch (err) {
      const { mensaje, enlaceInvalido } = mensajeDeError(err)
      if (enlaceInvalido) {
        setEstado("invalido")
      } else {
        setError(mensaje)
      }
    } finally {
      setLoading(false)
    }
  }

  if (estado === "validando") {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-6 text-center" role="status">
        <Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Verificando enlace…</p>
      </div>
    )
  }

  if (estado === "invalido") {
    return (
      <div className="flex w-full flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Enlace no disponible</h1>
          <p className="text-sm text-muted-foreground">
            Este enlace venció o ya fue utilizado. Los enlaces duran 15 minutos y solo sirven una vez.
          </p>
        </div>
        <Link to="/recuperar-password" className={botonClass}>
          Solicitar un enlace nuevo
        </Link>
        <Link to="/login" className={linkClass}>
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  if (estado === "completado") {
    return (
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 size={24} />
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link to="/login" className={botonClass}>
          Ir al login
        </Link>
      </div>
    )
  }

  const pocoTiempo = segundos <= 60

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">Debe tener al menos 8 caracteres.</p>
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
          pocoTiempo ? "bg-destructive/10 text-destructive" : "bg-amber-50 text-amber-800"
        }`}
        role="timer"
      >
        <Clock size={16} aria-hidden="true" />
        <span>
          Este enlace vence en <strong className="tabular-nums">{formatearTiempo(segundos)}</strong>
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Contraseña nueva</label>
        <PasswordInput
          icon={<Lock size={16} />}
          autoComplete="new-password"
          minLength={8}
          required
          value={nuevaPassword}
          onChange={(e) => setNuevaPassword(e.target.value)}
          placeholder="Ingrese su nueva contraseña"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
        <PasswordInput
          icon={<Lock size={16} />}
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          placeholder="Repita su nueva contraseña"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-linear-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  )
}
