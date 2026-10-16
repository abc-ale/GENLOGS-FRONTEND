import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proveedoresApi } from '../../../api/proveedoresApi';
import { contactosClienteApi } from '../../../api/contactosClienteApi';
import type { ContactoClienteRequest } from '../../../types/proveedor.types';
import { clientesKeys } from './useClientes';

export const proveedoresKeys = { all: ['proveedores'] as const };

export const useProveedores = () =>
  useQuery({ queryKey: proveedoresKeys.all, queryFn: proveedoresApi.listar, initialData: [] });

export const useCrearProveedor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: proveedoresApi.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: proveedoresKeys.all }),
  });
};

// Los contactos cuelgan del tercero (idTercero), no del cliente.
export const useAgregarContacto = (clienteId: number, idTercero: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactoClienteRequest) => contactosClienteApi.agregar(idTercero, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientesKeys.detalle(clienteId) }),
  });
};

export const useEliminarContacto = (clienteId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactoId: number) => contactosClienteApi.eliminar(contactoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientesKeys.detalle(clienteId) }),
  });
};