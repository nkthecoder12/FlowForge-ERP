import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/services/purchase.api';
import toast from 'react-hot-toast';

export const usePurchase = () => {
  const queryClient = useQueryClient();

  const useList = () => {
    return useQuery({
      queryKey: ['purchase-orders'],
      queryFn: () => purchaseApi.list(),
    });
  };

  const useGet = (id: string) => {
    return useQuery({
      queryKey: ['purchase-order', id],
      queryFn: () => purchaseApi.getById(id),
      enabled: !!id,
    });
  };

  const selectQuotationMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      purchaseApi.selectQuotation(id, payload),
    onSuccess: (_data, vars) => {
      toast.success('Vendor quote selected!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to select vendor quote');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: purchaseApi.confirm,
    onSuccess: (data, id) => {
      toast.success('Purchase Order confirmed and dispatched!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm purchase order');
    },
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { checkResult: 'approve' | 'reject'; reason?: string } }) =>
      purchaseApi.receive(id, payload),
    onSuccess: (data, vars) => {
      toast.success(`Shipment receipt ${vars.payload.checkResult}ed!`);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process receipt');
    },
  });

  return {
    useList,
    useGet,
    selectQuotation: selectQuotationMutation.mutateAsync,
    isSelectingQuotation: selectQuotationMutation.isPending,
    confirm: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    receive: receiveMutation.mutateAsync,
    isReceiving: receiveMutation.isPending,
  };
};
