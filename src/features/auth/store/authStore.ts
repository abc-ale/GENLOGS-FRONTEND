import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface AuthState {
  token: string | null
  nombreUsuario: string | null
  nombreRol: string | null
  login: (token: string, nombreUsuario: string, nombreRol: string) => void
  logout: () => void
  hasRole: (rol: string) => boolean
}

// Por seguridad, la sesión se guarda en sessionStorage (no localStorage):
// sobrevive a un F5 / recarga de página, pero se borra al cerrar la pestaña
// o el navegador. Así no queda una sesión abierta en un dispositivo compartido.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      nombreUsuario: null,
      nombreRol: null,
      login: (token, nombreUsuario, nombreRol) =>
        set({ token, nombreUsuario, nombreRol }),
      logout: () => set({ token: null, nombreUsuario: null, nombreRol: null }),
      hasRole: (rol) => get().nombreRol?.toLowerCase() === rol.toLowerCase(),
    }),
    {
      name: "genlogs-auth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)