import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListParams } from "@/shared/api/types";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
  type CustomerPayload,
} from "../api/customersApi";

export const customerKeys = {
  all: ["customers"] as const,
  list: (params: ListParams) => [...customerKeys.all, "list", params] as const,
};

export function useCustomers(params: ListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => listCustomers(params),
    placeholderData: keepPreviousData,
  });
}

export function useSaveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CustomerPayload }) =>
      id ? updateCustomer(id, payload) : createCustomer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
