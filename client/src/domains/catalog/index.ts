// Public API of the catalog domain. Other domains and app/ import only from here.
export { CapacitiesPage } from "./pages/CapacitiesPage";
export { MachinesPage } from "./pages/MachinesPage";
export { MakesPage } from "./pages/MakesPage";
export { catalogKeys, machineKeys } from "./hooks/useMachines";
export { machineTypeLabels } from "./model/types";
export type { Capacity, Machine, MachineType, Make } from "./model/types";
