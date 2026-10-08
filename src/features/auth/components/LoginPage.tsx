import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Lock } from "lucide-react"
import { login } from "@/api/authApi"
import { useAuthStore } from "@/features/auth/store/authStore"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { IconInput } from "@/components/ui/IconInput"

export function LoginPage() {
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const setAuth = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login({ nombreUsuario, password })

      // Clave unificada para match con ProtectedRoute y axiosClient
      const tokenRecibido = data.token;
      if (tokenRecibido) {
        localStorage.setItem("access_token", tokenRecibido)
      }
      
      setAuth(tokenRecibido, data.nombreUsuario, data.nombreRol)
      navigate("/dashboard")
    } catch (error: unknown) {
      const err = error as {
        code?: string
        response?: { status?: number; data?: { message?: string; error?: string } }
      }

      // 1) Timeout: el servidor de Render gratuito tarda en despertar.
      if (err.code === "ECONNABORTED") {
        setError("El servidor está despertando. Espera unos segundos y vuelve a intentar.")
        return
      }

      // 2) Sin respuesta: servidor caído, URL incorrecta o bloqueo por CORS.
      if (!err.response) {
        console.error("Sin respuesta del servidor (revisa VITE_API_URL y CORS):", error)
        setError("No se pudo conectar con el servidor. Verifica tu conexión o inténtalo más tarde.")
        return
      }

      // 3) El backend respondió con un mensaje.
      const data = err.response.data
      console.error("Respuesta del backend:", err.response.status, data)
      setError(data?.message || data?.error || "Usuario o contraseña incorrectos.")
      return
    }finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Usuario</label>
        <IconInput
          icon={<User size={16} />}
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          placeholder="Ingrese su usuario"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Contraseña</label>
        <PasswordInput
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          required
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-linear-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="text-center text-sm">
        <Link to="/recuperar-password" className="font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  )
}