export type MachineType = "front_load" | "top_load" | "semi_automatic" | "washer_dryer";

/** The brand on a machine (e.g. "Samsung"); companyName is the manufacturer behind it. */
export interface Make {
  id: string;
  name: string;
  companyName?: string;
  country?: string;
  isActive: boolean;
}

/** One of the capacity options a machine can be given. */
export interface Capacity {
  id: string;
  capacityKg: number;
}

/** A machine the company sells. Prices are in minor units (see shared/lib/money). */
export interface Machine {
  id: string;
  makeId: string;
  makeName: string;
  modelNumber: string;
  capacityKg: number;
  type: MachineType;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  isActive: boolean;
}

export const machineTypeLabels: Record<MachineType, string> = {
  front_load: "Front load",
  top_load: "Top load",
  semi_automatic: "Semi-automatic",
  washer_dryer: "Washer dryer",
};
