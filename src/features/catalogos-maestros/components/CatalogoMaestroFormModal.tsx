import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { mensajeErrorApi } from '@/api/productosApi'
import { useGuardarCatalogoMaestro } from '../hooks/useCatalogoMaestro'
import {
  concordar,
  generarSlug,
  idPadreDe,
  nuevoDe,
  type CampoCatalogo,
  type CatalogoMaestroDef,
  type RegistroCatalogo,
} from '../catalogosMaestros.config'

interface CatalogoMaestroFormModalProps {
  def: CatalogoMaestroDef
  /** Registro a editar; null para crear uno nuevo. */
  registro: RegistroCatalogo | null
  /** Registros activos del mismo catálogo (para elegir la categoría padre). */
  registros: RegistroCatalogo[]
  onClose: () => void
  onGuardado: (mensaje: string) => void
}

type Valores = Record<string, string>

function valoresIniciales(def: CatalogoMaestroDef, registro: RegistroCatalogo | null): Valores {
  const valores: Valores = {}
  for (const campo of def.campos) {
    if (campo.tipo === 'categoriaPadre') {
      const id = registro ? idPadreDe(registro) : null
      valores[campo.nombre] = id == null ? '' : String(id)
    } else {
      const valor = registro?.[campo.nombre]
      valores[campo.nombre] = valor == null ? '' : String(valor)
    }
  }
  return valores
}

function validarCampo(campo: CampoCatalogo, valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return campo.requerido ? `${campo.etiqueta} es obligatorio.` : null
  if (campo.tipo === 'entero') {
    const numero = Number(texto)
    if (!Number.isInteger(numero)) return `${campo.etiqueta} debe ser un número entero.`
    if (campo.min != null && numero < campo.min) return `${campo.etiqueta} debe ser como mínimo ${campo.min}.`
    if (campo.max != null && numero > campo.max) return `${campo.etiqueta} debe ser como máximo ${campo.max}.`
    return null
  }
  if (campo.tipo === 'categoriaPadre') return null
  if (campo.max != null && texto.length > campo.max) return `${campo.etiqueta} admite como máximo ${campo.max} caracteres.`
  if (campo.patron && !campo.patron.test(texto)) return campo.mensajePatron ?? `${campo.etiqueta} no tiene un formato válido.`
  return null
}

function construirPayload(def: CatalogoMaestroDef, valores: Valores): RegistroCatalogo {
  const datos: RegistroCatalogo = {}
  for (const campo of def.campos) {
    const texto = valores[campo.nombre].trim()
    if (campo.tipo === 'entero') datos[campo.nombre] = Number(texto)
    else if (campo.tipo === 'categoriaPadre') {
      datos[campo.nombre] = texto ? { [def.idCampo]: Number(texto) } : null
    } else datos[campo.nombre] = texto === '' ? null : texto
  }
  return datos
}

/** Alta y edición de un registro de cualquier catálogo maestro (RF-20, CU-14). */
export function CatalogoMaestroFormModal({ def, registro, registros, onClose, onGuardado }: CatalogoMaestroFormModalProps) {
  const [valores, setValores] = useState<Valores>(() => valoresIniciales(def, registro))
  // En una edición el slug ya existe y no se regenera solo.
  const [slugEditado, setSlugEditado] = useState(registro != null)
  const [error, setError] = useState<string | null>(null)
  const guardar = useGuardarCatalogoMaestro(def.recurso)
  const idRegistro = registro ? Number(registro[def.idCampo]) : null

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !guardar.isPending) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, guardar.isPending])

  function cambiar(campo: CampoCatalogo, valor: string) {
    const nuevo = campo.mayusculas ? valor.toUpperCase() : valor
    setValores((actuales) => {
      const siguiente = { ...actuales, [campo.nombre]: nuevo }
      // Rellena el slug a partir del nombre mientras el usuario no lo edite a mano.
      for (const otro of def.campos) {
        if (otro.tipo === 'slug' && otro.origen === campo.nombre && !slugEditado) {
          siguiente[otro.nombre] = generarSlug(nuevo)
        }
      }
      return siguiente
    })
    if (campo.tipo === 'slug') setSlugEditado(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    for (const campo of def.campos) {
      const invalido = validarCampo(campo, valores[campo.nombre])
      if (invalido) {
        setError(invalido)
        return
      }
    }
    setError(null)

    try {
      await guardar.mutateAsync({ id: idRegistro, datos: construirPayload(def, valores) })
      const nombre = valores[def.campos[0].nombre].trim()
      const singular = `${def.singular.charAt(0).toUpperCase()}${def.singular.slice(1)}`
      onGuardado(`${singular} «${nombre}» ${concordar(def, idRegistro == null ? 'registrad' : 'actualizad')}.`)
      onClose()
    } catch (e) {
      setError(
        mensajeErrorApi(e, `No se pudo guardar. Revisa que no exista otro registro con el mismo nombre o código.`),
      )
    }
  }

  const clase = 'h-10 w-full rounded-md border border-border bg-background px-3 text-sm'
  // La categoría padre no puede ser la propia categoría.
  const padres = registros.filter((r) => Number(r[def.idCampo]) !== idRegistro)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-catalogo-maestro"
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md space-y-4 rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <h2 id="titulo-catalogo-maestro" className="text-lg font-semibold text-foreground">
          {idRegistro == null ? nuevoDe(def) : `Editar ${def.singular}`}
        </h2>

        {def.campos.map((campo) => {
          const id = `cm-${def.clave}-${campo.nombre}`
          return (
            <div key={campo.nombre} className="space-y-1">
              <label htmlFor={id} className="text-sm font-medium">
                {campo.etiqueta}
                {!campo.requerido && <span className="font-normal text-muted-foreground"> (opcional)</span>}
              </label>
              {campo.tipo === 'categoriaPadre' ? (
                <select
                  id={id}
                  value={valores[campo.nombre]}
                  onChange={(e) => cambiar(campo, e.target.value)}
                  className={clase}
                >
                  <option value="">Sin categoría padre (nivel raíz)</option>
                  {padres.map((p) => (
                    <option key={String(p[def.idCampo])} value={String(p[def.idCampo])}>
                      {String(p[def.campos[0].nombre] ?? '')}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  type={campo.tipo === 'entero' ? 'number' : 'text'}
                  inputMode={campo.tipo === 'entero' ? 'numeric' : undefined}
                  step={campo.tipo === 'entero' ? 1 : undefined}
                  min={campo.min}
                  max={campo.tipo === 'entero' ? campo.max : undefined}
                  maxLength={campo.tipo === 'entero' ? undefined : campo.max}
                  required={campo.requerido}
                  placeholder={campo.placeholder}
                  value={valores[campo.nombre]}
                  onChange={(e) => cambiar(campo, e.target.value)}
                  className={clase}
                />
              )}
              {campo.tipo === 'slug' && (
                <p className="text-xs text-muted-foreground">Se genera a partir del nombre; puedes ajustarlo.</p>
              )}
            </div>
          )
        })}

        {error && (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={guardar.isPending}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardar.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-[#203f68] px-4 py-2 text-sm font-medium text-white hover:bg-[#203f68]/90 disabled:opacity-60"
          >
            {guardar.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
