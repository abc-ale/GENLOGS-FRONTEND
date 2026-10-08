import { useId, useState } from "react"
import type { ReactNode } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { FileText, Loader2, Plus, Trash2 } from "lucide-react"
import { listarMarcas } from "@/api/marcasApi"
import { listarUnidadesMedida } from "@/api/unidadesMedidaApi"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/ui/FileUploader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/utils"
import { productoSchema } from "@/lib/validators/producto.schema"
import type { ProductoFormValues } from "@/lib/validators/producto.schema"
import { ETIQUETA_TIPO_DOCUMENTO, TIPOS_DOCUMENTO } from "@/types/producto.types"
import type {
  DocumentoNuevo,
  DocumentoProducto,
  ImagenNueva,
  ImagenProducto,
  MediosNuevosProducto,
  TipoDocumento,
} from "@/types/producto.types"
import { CategoriaSelector } from "./CategoriaSelector"

interface ProductoFormProps {
  defaultValues?: Partial<ProductoFormValues>
  /** En edición: medios ya asociados al producto (solo lectura). */
  imagenesExistentes?: ImagenProducto[]
  documentosExistentes?: DocumentoProducto[]
  onSubmit: (values: ProductoFormValues, medios: MediosNuevosProducto) => void
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: string
  /** Mensaje de error del intento de guardado anterior. */
  errorMessage?: string | null
}

/** Nombres frecuentes en la ficha técnica; alimentan las sugerencias del formulario. */
const CARACTERISTICAS_SUGERIDAS = ["Material", "Aplicación", "Tiempo de entrega"]
const CARACTERISTICAS_DATALIST = [
  ...CARACTERISTICAS_SUGERIDAS,
  "Dimensiones",
  "Peso",
  "Norma",
  "Compatibilidad",
]

const selectClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

function Campo({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function ProductoForm({
  defaultValues,
  imagenesExistentes = [],
  documentosExistentes = [],
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Guardar producto",
  errorMessage,
}: ProductoFormProps) {
  const uid = useId()
  const idDe = (campo: string) => `${uid}-${campo}`

  const { data: marcas, isLoading: cargandoMarcas } = useQuery({
    queryKey: ["marcas"],
    queryFn: listarMarcas,
    staleTime: 5 * 60_000,
  })
  const { data: unidades, isLoading: cargandoUnidades } = useQuery({
    queryKey: ["unidades-medida"],
    queryFn: listarUnidadesMedida,
    staleTime: 5 * 60_000,
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigoProducto: "",
      stock: 0,
      nombreProducto: "",
      procedencia: "",
      descripcion: "",
      visibleWeb: true,
      caracteristicas: [],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "caracteristicas" })
  const caracteristicas = useWatch({ control, name: "caracteristicas" })

  // Medios nuevos: ya están en Cloudinary y se asocian al producto al guardar.
  const [imagenes, setImagenes] = useState<ImagenNueva[]>([])
  const [documentos, setDocumentos] = useState<DocumentoNuevo[]>([])
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("FICHA_TECNICA")
  const [subiendoImagenes, setSubiendoImagenes] = useState(false)
  const [subiendoDocumentos, setSubiendoDocumentos] = useState(false)

  const tienePrincipalExistente = imagenesExistentes.some((i) => i.esPrincipal)
  const subiendo = subiendoImagenes || subiendoDocumentos

  function handleImagenSubida(url: string) {
    setImagenes((prev) => [
      ...prev,
      { url, esPrincipal: prev.length === 0 && !tienePrincipalExistente },
    ])
  }

  function handleImagenQuitada(url: string) {
    setImagenes((prev) => {
      const restantes = prev.filter((i) => i.url !== url)
      const necesitaPrincipal =
        !tienePrincipalExistente && restantes.length > 0 && !restantes.some((i) => i.esPrincipal)
      return necesitaPrincipal
        ? restantes.map((imagen, index) => (index === 0 ? { ...imagen, esPrincipal: true } : imagen))
        : restantes
    })
  }

  function marcarPrincipal(url: string) {
    setImagenes((prev) => prev.map((i) => ({ ...i, esPrincipal: i.url === url })))
  }

  function agregarSugerida(nombre: string) {
    append({ nombreCaracteristica: nombre, valorCaracteristica: "", unidadCaracteristica: "" })
  }

  const nombresActuales = new Set(
    (caracteristicas ?? []).map((c) => c.nombreCaracteristica.trim().toLowerCase())
  )

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, { imagenes, documentos }))}
      noValidate
      className="flex flex-col gap-8"
    >
      {/* Datos base */}
      <section aria-labelledby={idDe("datos")} className="flex flex-col gap-4">
        <h2 id={idDe("datos")} className="text-base font-semibold">
          Datos del producto
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Campo id={idDe("codigo")} label="Código" error={errors.codigoProducto?.message}>
            <Input
              id={idDe("codigo")}
              autoComplete="off"
              aria-invalid={!!errors.codigoProducto}
              aria-describedby={errors.codigoProducto ? `${idDe("codigo")}-error` : undefined}
              className={cn(errors.codigoProducto && "border-destructive")}
              {...register("codigoProducto")}
            />
          </Campo>

          <Campo id={idDe("stock")} label="Stock disponible" error={errors.stock?.message}>
            <Input
              id={idDe("stock")}
              type="number"
              min={0}
              step={1}
              aria-invalid={!!errors.stock}
              aria-describedby={errors.stock ? `${idDe("stock")}-error` : undefined}
              {...register("stock", { valueAsNumber: true })}
            />
          </Campo>

          <Campo id={idDe("nombre")} label="Nombre" error={errors.nombreProducto?.message}>
            <Input
              id={idDe("nombre")}
              autoComplete="off"
              aria-invalid={!!errors.nombreProducto}
              aria-describedby={errors.nombreProducto ? `${idDe("nombre")}-error` : undefined}
              className={cn(errors.nombreProducto && "border-destructive")}
              {...register("nombreProducto")}
            />
          </Campo>

          <Campo id={idDe("categoria")} label="Categoría" error={errors.idCategoriaProducto?.message}>
            <Controller
              control={control}
              name="idCategoriaProducto"
              render={({ field }) => (
                <CategoriaSelector
                  id={idDe("categoria")}
                  value={field.value}
                  onChange={(id) => field.onChange(id)}
                  invalid={!!errors.idCategoriaProducto}
                  aria-describedby={errors.idCategoriaProducto ? `${idDe("categoria")}-error` : undefined}
                />
              )}
            />
          </Campo>

          <Campo id={idDe("unidad")} label="Unidad de medida" error={errors.idUnidadMedida?.message}>
            <Controller
              control={control}
              name="idUnidadMedida"
              render={({ field }) => (
                <select
                  id={idDe("unidad")}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  onBlur={field.onBlur}
                  disabled={cargandoUnidades}
                  aria-invalid={!!errors.idUnidadMedida}
                  className={cn(selectClass, errors.idUnidadMedida ? "border-destructive" : "border-input")}
                >
                  <option value="" disabled>
                    {cargandoUnidades ? "Cargando…" : "Selecciona una unidad"}
                  </option>
                  {unidades?.map((u) => (
                    <option key={u.idUnidadMedida} value={u.idUnidadMedida}>
                      {u.nombreUnidad} ({u.codigoUnidad})
                    </option>
                  ))}
                </select>
              )}
            />
          </Campo>

          <Campo id={idDe("marca")} label="Marca (opcional)">
            <Controller
              control={control}
              name="idMarca"
              render={({ field }) => (
                <select
                  id={idDe("marca")}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  onBlur={field.onBlur}
                  disabled={cargandoMarcas}
                  className={cn(selectClass, "border-input")}
                >
                  <option value="">{cargandoMarcas ? "Cargando…" : "Sin marca"}</option>
                  {marcas?.map((m) => (
                    <option key={m.idMarca} value={m.idMarca}>
                      {m.nombreMarca}
                    </option>
                  ))}
                </select>
              )}
            />
          </Campo>

          <Campo id={idDe("procedencia")} label="Procedencia (opcional)" error={errors.procedencia?.message}>
            <Input
              id={idDe("procedencia")}
              autoComplete="off"
              aria-invalid={!!errors.procedencia}
              {...register("procedencia")}
            />
          </Campo>
        </div>

        <Campo id={idDe("descripcion")} label="Descripción (opcional)" error={errors.descripcion?.message}>
          <textarea
            id={idDe("descripcion")}
            rows={4}
            aria-invalid={!!errors.descripcion}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("descripcion")}
          />
        </Campo>

        <label className="flex w-fit items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" {...register("visibleWeb")} />
          Mostrar en el catálogo web
        </label>
      </section>

      {/* Ficha técnica dinámica */}
      <section aria-labelledby={idDe("ficha")} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={idDe("ficha")} className="text-base font-semibold">
            Ficha técnica
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => agregarSugerida("")}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Agregar característica
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sugeridas:</span>
          {CARACTERISTICAS_SUGERIDAS.map((nombre) => {
            const yaAgregada = nombresActuales.has(nombre.toLowerCase())
            return (
              <button
                key={nombre}
                type="button"
                disabled={yaAgregada}
                onClick={() => agregarSugerida(nombre)}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {nombre}
              </button>
            )
          })}
        </div>

        <datalist id={idDe("nombres")}>
          {CARACTERISTICAS_DATALIST.map((nombre) => (
            <option key={nombre} value={nombre} />
          ))}
        </datalist>

        {fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Aún no agregaste características. Suma material, aplicación o tiempo de entrega para que
            el cliente los vea en la ficha.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const errorFila = errors.caracteristicas?.[index]
            return (
              <li key={field.id} className="grid gap-2 md:grid-cols-[1fr_1.5fr_8rem_auto] md:items-start">
                <div className="flex flex-col gap-1">
                  <Input
                    aria-label={`Nombre de la característica ${index + 1}`}
                    placeholder="Nombre (ej. Material)"
                    list={idDe("nombres")}
                    autoComplete="off"
                    aria-invalid={!!errorFila?.nombreCaracteristica}
                    className={cn(errorFila?.nombreCaracteristica && "border-destructive")}
                    {...register(`caracteristicas.${index}.nombreCaracteristica`)}
                  />
                  {errorFila?.nombreCaracteristica && (
                    <p role="alert" className="text-sm text-destructive">
                      {errorFila.nombreCaracteristica.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Input
                    aria-label={`Valor de la característica ${index + 1}`}
                    placeholder="Valor (ej. Acero inoxidable 304)"
                    autoComplete="off"
                    aria-invalid={!!errorFila?.valorCaracteristica}
                    className={cn(errorFila?.valorCaracteristica && "border-destructive")}
                    {...register(`caracteristicas.${index}.valorCaracteristica`)}
                  />
                  {errorFila?.valorCaracteristica && (
                    <p role="alert" className="text-sm text-destructive">
                      {errorFila.valorCaracteristica.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Input
                    aria-label={`Unidad de la característica ${index + 1}`}
                    placeholder="Unidad"
                    autoComplete="off"
                    aria-invalid={!!errorFila?.unidadCaracteristica}
                    {...register(`caracteristicas.${index}.unidadCaracteristica`)}
                  />
                  {errorFila?.unidadCaracteristica && (
                    <p role="alert" className="text-sm text-destructive">
                      {errorFila.unidadCaracteristica.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Quitar la característica ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            )
          })}
        </ul>

        {(errors.caracteristicas?.message || errors.caracteristicas?.root?.message) && (
          <p role="alert" className="text-sm text-destructive">
            {errors.caracteristicas?.message ?? errors.caracteristicas?.root?.message}
          </p>
        )}
      </section>

      {/* Imágenes */}
      <section aria-labelledby={idDe("imagenes")} className="flex flex-col gap-3">
        <h2 id={idDe("imagenes")} className="text-base font-semibold">
          Imágenes
        </h2>

        {imagenesExistentes.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Ya cargadas</p>
            <ul className="flex flex-wrap gap-2">
              {imagenesExistentes.map((img) => (
                <li key={img.idProductoImagen} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
                  <img src={img.urlImagen} alt="Imagen del producto" className="h-full w-full object-cover" />
                  {img.esPrincipal && (
                    <span className="absolute inset-x-0 bottom-0 bg-primary/80 px-1 py-0.5 text-center text-[10px] text-primary-foreground">
                      Principal
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <FileUploader
          tipo="imagen"
          multiple
          maxArchivos={8}
          label={imagenesExistentes.length > 0 ? "Agregar más imágenes" : "Fotos del producto"}
          onUploaded={(resultado) => handleImagenSubida(resultado.url)}
          onRemoved={(resultado) => handleImagenQuitada(resultado.url)}
          onUploadingChange={setSubiendoImagenes}
          disabled={submitting}
        />

        {!tienePrincipalExistente && imagenes.length > 1 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Imagen principal</p>
            <div role="group" aria-label="Elegir imagen principal" className="flex flex-wrap gap-2">
              {imagenes.map((img, index) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => marcarPrincipal(img.url)}
                  aria-pressed={img.esPrincipal}
                  aria-label={`Imagen ${index + 1}${img.esPrincipal ? " (principal)" : ""}`}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    img.esPrincipal ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Documentos */}
      <section aria-labelledby={idDe("documentos")} className="flex flex-col gap-3">
        <h2 id={idDe("documentos")} className="text-base font-semibold">
          Documentos
        </h2>

        {documentosExistentes.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Ya cargados</p>
            <ul className="flex flex-col gap-1 text-sm">
              {documentosExistentes.map((doc) => (
                <li key={doc.idDocumento} className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <a href={doc.urlDocumento} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {doc.nombreDocumento}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {ETIQUETA_TIPO_DOCUMENTO[doc.tipoDocumento] ?? doc.tipoDocumento}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Campo id={idDe("tipo-doc")} label="Tipo de los documentos que vas a subir" className="max-w-xs">
          <select
            id={idDe("tipo-doc")}
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
            className={cn(selectClass, "border-input")}
          >
            {TIPOS_DOCUMENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETA_TIPO_DOCUMENTO[tipo]}
              </option>
            ))}
          </select>
        </Campo>

        <FileUploader
          tipo="documento"
          multiple
          maxArchivos={6}
          label="Fichas técnicas, manuales y certificados"
          onUploaded={(resultado) =>
            setDocumentos((prev) => [
              ...prev,
              { url: resultado.url, nombreDocumento: resultado.nombreArchivo, tipoDocumento },
            ])
          }
          onRemoved={(resultado) => setDocumentos((prev) => prev.filter((d) => d.url !== resultado.url))}
          onUploadingChange={setSubiendoDocumentos}
          disabled={submitting}
        />
      </section>

      {errorMessage && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting || subiendo}>
          {(submitting || subiendo) && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? "Guardando…" : subiendo ? "Subiendo archivos…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
