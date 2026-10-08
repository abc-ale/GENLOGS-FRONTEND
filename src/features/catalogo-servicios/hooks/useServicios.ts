import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listarServicios,
  buscarServicioPorId,
  registrarServicio,
  actualizarServicio,
  desactivarServicio,
} from "@/api/serviciosApi"
import type { ServicioFormValues } from "@/types/servicio.types"

export function useServicios(idCategoriaServicio?: number, soloActivos = true) {
  return useQuery({
    queryKey: ["servicios", { idCategoriaServicio, soloActivos }],
    queryFn: () => listarServicios({ idCategoriaServicio, soloActivos }),
  })
}

export function useServicio(id: number | undefined) {
  return useQuery({
    queryKey: ["servicio", id],
    queryFn: () => buscarServicioPorId(id as number),
    enabled: id !== undefined,
  })
}

export function useCrearServicio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ServicioFormValues) => registrarServicio(valores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] })
    },
  })
}

export function useActualizarServicio(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ServicioFormValues) => actualizarServicio(id, valores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] })
      queryClient.invalidateQueries({ queryKey: ["servicio", id] })
    },
  })
}

export function useDesactivarServicio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desactivarServicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] })
    },
  })
}
