import axios from "axios"

// Si nadie configuró VITE_API_URL (falta el .env.local), apuntamos al
// backend real desplegado en Render en vez de a una ruta relativa rota
// (antes caía en "/api/v1", que ni siquiera es el prefijo real del backend
// y termina pegándole al propio Vite dev server -> 404 disfrazado de
// "usuario o contraseña incorrectos").
const DEFAULT_API_URL = "https://genlogs-backend-bkuv.onrender.com/api"

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL
  if (envUrl) return envUrl.replace(/\/+$/, "")
  return DEFAULT_API_URL
}

export const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60_000,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function cerrarSesionInvalida(motivo: string) {
  console.warn(`[AUTH] Cerrando sesión: ${motivo}`)
  // Limpia tanto la clave que lee axios/ProtectedRoute (localStorage) como la
  // que persiste el estado de Zustand (sessionStorage "genlogs-auth"), para
  // no dejar una sesión a medias que vuelva a mandarnos al Dashboard roto.
  localStorage.removeItem("access_token")
  sessionStorage.removeItem("genlogs-auth")
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Solo el 401 significa "tu token no sirve" -> se cierra la sesión. El backend
    // no emite refresh token ni tiene /auth/refresh: el JWT dura 24 h y, al vencer,
    // el usuario vuelve a iniciar sesión. Un 403 puede ser simplemente "no tienes
    // permiso para esto puntual" con una sesión por lo demás válida, así que
    // NO debe desloguear: cada pantalla ya maneja su propio estado de error.
    if (status === 401) {
      console.warn(`[AUTH] 401 recibido en ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`)
      cerrarSesionInvalida("token inválido o vencido")
    } else if (status === 403) {
      console.warn(`[AUTH] 403 recibido en ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (no desloguea, solo informativo)`)
    }

    return Promise.reject(error)
  }
)

export const http = axiosClient