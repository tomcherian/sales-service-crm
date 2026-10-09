import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListParams } from "@/shared/api/types";
import {
  createEmployee,
  deactivateEmployee,
  listEmployees,
  updateEmployee,
  type EmployeePayload,
} from "../api/staffApi";
import type { StaffRole } from "../model/types";

// Every staff query starts with "staff", so invalidating staffKeys.all also
// refreshes lists other domains read, such as the customer form's salesperson picker.
export const staffKeys = {
  all: ["staff"] as const,
  list: (role: StaffRole, params: ListParams) =>
    [...staffKeys.all, "list", role, params] as const,
};

export function useEmployees(role: StaffRole, params: ListParams) {
  return useQuery({
    queryKey: staffKeys.list(role, params),
    queryFn: () => listEmployees({ role, ...params }),
    placeholderData: keepPreviousData,
  });
}

/** Options for pickers. The server caps a page at 100, which is enough for now. */
export function useSalespeople() {
  return useEmployees("salesperson", { page: 1, limit: 100, search: "" });
}

export function useSaveEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: EmployeePayload }) =>
      id ? updateEmployee(id, payload) : createEmployee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}
