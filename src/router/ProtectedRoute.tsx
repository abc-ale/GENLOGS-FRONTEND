import { Navigate, useLocation } from "react-router-dom"
import { Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

export function ProtectedRoute() {
  const location = useLocation()
  const token = localStorage.getItem("access_token")
  const tokenStore = useAuthStore((state) => state.token)

  // Ambas fuentes deben coincidir en tener un token: si una quedó vacía
  // (p. ej. axiosClient cerró la sesión por un 401/403) no se debe permitir
  // pasar solo porque la otra key todavía no se limpió.
  if (!token || !tokenStore) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}