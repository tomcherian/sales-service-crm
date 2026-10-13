import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListParams } from "@/shared/api/types";
import {
  createMachine,
  listMachines,
  setMachineActive,
  updateMachine,
  type MachinePayload,
} from "../api/machinesApi";

// Every catalog query starts with "catalog", so a change to a make or capacity can
// refresh the machine list and the machine form's pickers by invalidating catalogKeys.all.
export const catalogKeys = { all: ["catalog"] as const };

export const machineKeys = {
  all: [...catalogKeys.all, "machines"] as const,
  list: (params: ListParams) => [...machineKeys.all, "list", params] as const,
};

export function useMachines(params: ListParams) {
  return useQuery({
    queryKey: machineKeys.list(params),
    queryFn: () => listMachines(params),
    placeholderData: keepPreviousData,
  });
}

export function useSaveMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: MachinePayload }) =>
      id ? updateMachine(id, payload) : createMachine(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  });
}

export function useSetMachineActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setMachineActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  });
}
