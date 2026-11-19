import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogosMaestrosApi } from '@/api/catalogosMaestrosApi'
import type { RegistroCatalogo } from '../catalogosMaestros.config'

export const catalogoMaestroKeys = {
  recurso: (recurso: string) => ['catalogos-maestros', recurso] as const,
  lista: (recurso: string, soloActivos: boolean) => ['catalogos-maestros', recurso, soloActivos] as const,
}

/**
 * Además de la lista de esta pantalla, refresca las cachés que usan los otros
 * formularios (p. ej. ['monedas'] y ['condiciones-pago'] en facturación).
 */
function useInvalidarCatalogo(recurso: string) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: catalogoMaestroKeys.recurso(recurso) }),
      queryClient.invalidateQueries({ queryKey: [recurso] }),
    ])
}

export function useCatalogoMaestro(recurso: string, soloActivos: boolean) {
  return useQuery({
    queryKey: catalogoMaestroKeys.lista(recurso, soloActivos),
    queryFn: () => catalogosMaestrosApi.listar(recurso, soloActivos),
  })
}

export function useGuardarCatalogoMaestro(recurso: string) {
  const invalidar = useInvalidarCatalogo(recurso)
  return useMutation({
    mutationFn: ({ id, datos }: { id: number | null; datos: RegistroCatalogo }) =>
      id == null
        ? catalogosMaestrosApi.crear(recurso, datos)
        : catalogosMaestrosApi.actualizar(recurso, id, datos),
    onSuccess: invalidar,
  })
}

export function useDesactivarCatalogoMaestro(recurso: string) {
  const invalidar = useInvalidarCatalogo(recurso)
  return useMutation({
    mutationFn: (id: number) => catalogosMaestrosApi.desactivar(recurso, id),
    onSuccess: invalidar,
  })
}
