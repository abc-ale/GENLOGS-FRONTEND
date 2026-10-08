import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../../../api/clientesApi';
import { clientesKeys } from './useClientes';

export const useCrearCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesApi.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: clientesKeys.all }),
  });
};
