import { z } from "zod";
import { MONEY_INPUT_PATTERN, toMinorUnits, toMoneyInput } from "@/shared/lib/money";
import type { MachinePayload } from "../api/machinesApi";
import type { Machine } from "./types";

// Money inputs are kept as strings in the form so partial typing ("12.") isn't lost,
// then converted in toMachinePayload.
const money = z.string().trim().regex(MONEY_INPUT_PATTERN, "Enter an amount such as 1999.50");

export const machineFormSchema = z.object({
  // The selected make's ID.
  make: z.string().min(1, "Make is required"),
  modelNumber: z.string().trim().min(1, "Model is required").max(80),
  // The selected capacity option, as the select's string value.
  capacityKg: z.string().min(1, "Capacity is required"),
  type: z.enum(["front_load", "top_load", "semi_automatic", "washer_dryer"]),
  costPrice: money,
  retailPrice: money,
  wholesalePrice: money,
});

export type MachineFormValues = z.infer<typeof machineFormSchema>;

export const machineFormFields = [
  "make",
  "modelNumber",
  "capacityKg",
  "type",
  "costPrice",
  "retailPrice",
  "wholesalePrice",
] as const satisfies readonly (keyof MachineFormValues)[];

export const emptyMachineForm: MachineFormValues = {
  make: "",
  modelNumber: "",
  capacityKg: "",
  type: "front_load",
  costPrice: "",
  retailPrice: "",
  wholesalePrice: "",
};

export function toMachineFormValues(machine: Machine | null): MachineFormValues {
  if (!machine) return emptyMachineForm;
  return {
    make: machine.makeId,
    modelNumber: machine.modelNumber,
    capacityKg: String(machine.capacityKg),
    type: machine.type,
    costPrice: toMoneyInput(machine.costPrice),
    retailPrice: toMoneyInput(machine.retailPrice),
    wholesalePrice: toMoneyInput(machine.wholesalePrice),
  };
}

export function toMachinePayload(values: MachineFormValues): MachinePayload {
  return {
    make: values.make,
    modelNumber: values.modelNumber,
    capacityKg: Number(values.capacityKg),
    type: values.type,
    costPrice: toMinorUnits(values.costPrice),
    retailPrice: toMinorUnits(values.retailPrice),
    wholesalePrice: toMinorUnits(values.wholesalePrice),
  };
}
