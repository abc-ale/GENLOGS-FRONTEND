import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Truck } from "lucide-react"
import { facturacionApi } from "@/api/facturacionApi"
import { mensajeErrorApi } from "@/api/productosApi"
import { useAsociarProveedorProducto } from "@/hooks/useProductos"
import { useProveedores } from "@/features/clientes-proveedores/hooks/useProveedores"

interface ProveedorProductoFormProps {
  idProducto: number
  nombreProducto: string
}

const campo =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60"

/**
 * Asocia un proveedor al producto con precio referencial, moneda, plazo de entrega
 * en días y si es el proveedor preferido (RF-15, CU-11). El MVP no maneja stock propio:
 * estos datos comerciales viven en la relación producto-proveedor.
 */
export function ProveedorProductoForm({ idProducto, nombreProducto }: ProveedorProductoFormProps) {
  const [idProveedor, setIdProveedor] = useState("")
  const [precio, setPrecio] = useState("")
  const [idMoneda, setIdMoneda] = useState("")
  const [plazo, setPlazo] = useState("")
  const [preferido, setPreferido] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  const proveedores = useProveedores()
  // Misma clave que el formulario de facturación: comparten la caché de monedas.
  const monedas = useQuery({
    queryKey: ["monedas"],
    queryFn: facturacionApi.listarMonedas,
    staleTime: 1000 * 60 * 30,
  })
  const asociar = useAsociarProveedorProducto(idProducto)

  const proveedoresActivos = (proveedores.data ?? []).filter((p) => p.status !== "I")
  const proveedorElegido = proveedoresActivos.find((p) => String(p.idProveedor) === idProveedor)

  function limpiar() {
    setIdProveedor("")
    setPrecio("")
    setIdMoneda("")
    setPlazo("")
    setPreferido(false)
  }

  function validar(): string | null {
    if (!proveedorElegido) return "Selecciona el proveedor."
    if (precio !== "") {
      const valor = Number(precio)
      if (!Number.isFinite(valor) || valor < 0) return "El precio referencial no puede ser negativo."
      if (Math.round(valor * 100) / 100 !== valor) return "El precio admite como máximo 2 decimales."
      if (!idMoneda) return "Indica la moneda del precio referencial."
    }
    if (plazo !== "") {
      const dias = Number(plazo)
      if (!Number.isInteger(dias) || dias < 0) return "El plazo de entrega debe ser un número entero de días (0 o más)."
    }
    return null
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setExito(null)
    const invalido = validar()
    if (invalido) {
      setError(invalido)
      return
    }
    setError(null)

    try {
      await asociar.mutateAsync({
        idProveedor: Number(idProveedor),
        precioReferencial: precio === "" ? undefined : Number(precio),
        idMoneda: precio === "" || !idMoneda ? undefined : Number(idMoneda),
        tiempoEntregaDias: plazo === "" ? undefined : Number(plazo),
        proveedorPreferido: preferido,
      })
      const nombre = proveedorElegido?.tercero.razonSocial ?? "El proveedor"
      setExito(
        `${nombre} quedó asociado a «${nombreProducto}»${preferido ? " como proveedor preferido" : ""}.`
      )
      limpiar()
    } catch (e) {
      setError(mensajeErrorApi(e, "No se pudo asociar el proveedor. Inténtalo de nuevo."))
    }
  }

  const cargando = proveedores.isLoading || monedas.isLoading

  return (
    <section
      aria-labelledby="titulo-proveedores-producto"
      className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm"
    >
      <header className="space-y-1">
        <h2 id="titulo-proveedores-producto" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Truck className="h-5 w-5 text-accent" aria-hidden="true" />
          Proveedores, precios y plazos
        </h2>
        <p className="text-sm text-muted-foreground">
          Registra el precio referencial y el plazo de entrega de cada proveedor. Si eliges un proveedor ya
          asociado, se actualizan sus datos. Marcar uno como preferido quita esa marca al anterior.
        </p>
      </header>

      {(proveedores.isError || monedas.isError) && (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar los proveedores o las monedas.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 sm:col-span-2 lg:col-span-4">
          <label htmlFor="pp-proveedor" className="text-sm font-medium">Proveedor</label>
          <select
            id="pp-proveedor"
            required
            disabled={cargando}
            value={idProveedor}
            onChange={(e) => setIdProveedor(e.target.value)}
            className={campo}
          >
            <option value="">{cargando ? "Cargando…" : "Selecciona un proveedor"}</option>
            {proveedoresActivos.map((p) => (
              <option key={p.idProveedor} value={String(p.idProveedor)}>
                {p.tercero.razonSocial}
                {p.tercero.numeroDocumento ? ` — ${p.tercero.numeroDocumento}` : ""}
              </option>
            ))}
          </select>
          {!cargando && proveedoresActivos.length === 0 && (
            <p className="text-xs text-muted-foreground">No hay proveedores activos registrados.</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="pp-precio" className="text-sm font-medium">
            Precio referencial <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="pp-precio"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className={campo}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="pp-moneda" className="text-sm font-medium">Moneda</label>
          <select
            id="pp-moneda"
            disabled={cargando || precio === ""}
            required={precio !== ""}
            aria-describedby="pp-moneda-ayuda"
            value={idMoneda}
            onChange={(e) => setIdMoneda(e.target.value)}
            className={campo}
          >
            <option value="">Selecciona</option>
            {(monedas.data ?? []).map((m) => (
              <option key={m.idMoneda} value={String(m.idMoneda)}>
                {m.codigoMoneda} — {m.nombreMoneda}
              </option>
            ))}
          </select>
          <p id="pp-moneda-ayuda" className="text-xs text-muted-foreground">
            Obligatoria si indicas un precio.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="pp-plazo" className="text-sm font-medium">
            Plazo de entrega (días) <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="pp-plazo"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={plazo}
            onChange={(e) => setPlazo(e.target.value)}
            className={campo}
          />
        </div>

        <div className="flex items-end pb-2">
          <label htmlFor="pp-preferido" className="flex items-center gap-2 text-sm font-medium">
            <input
              id="pp-preferido"
              type="checkbox"
              checked={preferido}
              onChange={(e) => setPreferido(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Proveedor preferido
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={asociar.isPending || cargando}
            className="inline-flex items-center gap-2 rounded-md bg-[#203f68] px-4 py-2 text-sm font-medium text-white hover:bg-[#203f68]/90 disabled:opacity-60"
          >
            {asociar.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Guardar proveedor
          </button>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {exito && <p role="status" className="text-sm text-emerald-700">{exito}</p>}
        </div>
      </form>
    </section>
  )
}
