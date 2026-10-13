import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListParams } from "@/shared/api/types";
import { createCapacity, deleteCapacity, listCapacities } from "../api/capacitiesApi";
import { catalogKeys } from "./useMachines";

export const capacityKeys = {
  all: [...catalogKeys.all, "capacities"] as const,
  list: (params: ListParams) => [...capacityKeys.all, "list", params] as const,
};

export function useCapacities(params: ListParams) {
  return useQuery({
    queryKey: capacityKeys.list(params),
    queryFn: () => listCapacities(params),
    placeholderData: keepPreviousData,
  });
}

/** Capacities for pickers. The server caps a page at 100, which is enough for now. */
export function useCapacityOptions() {
  return useCapacities({ page: 1, limit: 100, search: "" });
}

export function useCreateCapacity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCapacity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: capacityKeys.all }),
  });
}

export function useDeleteCapacity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCapacity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: capacityKeys.all }),
  });
}
