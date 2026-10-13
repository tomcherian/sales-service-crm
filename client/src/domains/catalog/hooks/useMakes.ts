import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListParams } from "@/shared/api/types";
import {
  createMake,
  listMakes,
  setMakeActive,
  updateMake,
  type MakePayload,
} from "../api/makesApi";
import { catalogKeys } from "./useMachines";

export const makeKeys = {
  all: [...catalogKeys.all, "makes"] as const,
  list: (params: ListParams & { isActive?: boolean }) =>
    [...makeKeys.all, "list", params] as const,
};

export function useMakes(params: ListParams & { isActive?: boolean }) {
  return useQuery({
    queryKey: makeKeys.list(params),
    queryFn: () => listMakes(params),
    placeholderData: keepPreviousData,
  });
}

/** Active makes for pickers. The server caps a page at 100, which is enough for now. */
export function useMakeOptions() {
  return useMakes({ page: 1, limit: 100, search: "", isActive: true });
}

// Machines show the make's name, so make changes invalidate the whole catalog.
export function useSaveMake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: MakePayload }) =>
      id ? updateMake(id, payload) : createMake(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
  });
}

export function useSetMakeActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setMakeActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
  });
}
