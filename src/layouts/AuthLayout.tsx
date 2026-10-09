import { Outlet } from "react-router-dom"
import { Sun, Moon } from "lucide-react"
import logoGenlogs from "../assets/GENLOGS.png"
import { useTheme } from "@/hooks/useTheme"

export function AuthLayout() {
  const { tema, alternarTema } = useTheme()

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#38BDF8] dark:from-[#06182B] dark:via-[#0B3A66] dark:to-[#0369A1] p-4 sm:p-6">
      <button
        type="button"
        onClick={alternarTema}
        aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors sm:right-6 sm:top-6"
      >
        {tema === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </button>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl shadow-black/20">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <img
            src={logoGenlogs}
            alt="GenLogs S.A.C."
            width={192}
            height={80}
            className="h-28 w-auto sm:h-36 object-contain"
          />
        </div>

        <Outlet />
      </div>
    </div>
  )
}