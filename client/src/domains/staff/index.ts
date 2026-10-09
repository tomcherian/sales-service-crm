// Public API of the staff domain. Other domains and app/ import only from here.
export { StaffPage } from "./pages/StaffPage";
export { useSalespeople, staffKeys } from "./hooks/useStaff";
export { staffRoleLabels } from "./model/types";
export type { Employee, StaffRole } from "./model/types";
