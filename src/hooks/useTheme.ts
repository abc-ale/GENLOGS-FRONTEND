import { useCallback, useEffect, useState } from "react"

export type Tema = "light" | "dark"

const CLAVE_STORAGE = "genlogs-theme"

function leerTemaGuardado(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    if (guardado === "light" || guardado === "dark") return guardado
  } catch {
    // localStorage puede no estar disponible (modo incógnito estricto, etc.)
  }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }
  return "light"
}

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "dark")
  try {
    localStorage.setItem(CLAVE_STORAGE, tema)
  } catch {
    // si no se puede persistir, igual queda aplicado para esta sesión
  }
}

/** Hook global de tema claro/oscuro. El script inline en index.html ya
 *  aplicó la clase `dark` al <html> antes del primer render (evita el
 *  "flash" de tema equivocado); este hook solo sincroniza el estado de
 *  React con esa clase y expone `alternarTema` para el botón del header. */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : leerTemaGuardado()
  )

  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  const alternarTema = useCallback(() => {
    setTema((actual) => (actual === "dark" ? "light" : "dark"))
  }, [])

  return { tema, setTema, alternarTema }
}
