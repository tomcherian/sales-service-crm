import { http } from "@/shared/api/http";
import { refId, toPage } from "@/shared/api/mappers";
import type { ApiResponse, ListParams, RefDto } from "@/shared/api/types";
import type { Machine, MachineType } from "../model/types";

// Shape of a machine model document as the server sends it.
interface MachineDto {
  _id: string;
  // Populated with the make's name on reads.
  make: RefDto;
  modelNumber: string;
  capacityKg: number;
  type: MachineType;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  isActive: boolean;
}

export interface MachinePayload {
  /** The make's ID. */
  make: string;
  modelNumber: string;
  capacityKg: number;
  type: MachineType;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
}

function toMachine(dto: MachineDto): Machine {
  return {
    id: dto._id,
    makeId: refId(dto.make) ?? "",
    makeName: (typeof dto.make === "object" && dto.make?.name) || "—",
    modelNumber: dto.modelNumber,
    capacityKg: dto.capacityKg,
    type: dto.type,
    costPrice: dto.costPrice,
    retailPrice: dto.retailPrice,
    wholesalePrice: dto.wholesalePrice,
    isActive: dto.isActive,
  };
}

export async function listMachines(params: ListParams & { type?: MachineType }) {
  const response = await http.get<ApiResponse<MachineDto[]>>("/machine-models", {
    params,
  });
  return toPage(response.data, toMachine);
}

export async function createMachine(payload: MachinePayload) {
  const response = await http.post<ApiResponse<MachineDto>>("/machine-models", payload);
  return toMachine(response.data.data);
}

export async function updateMachine(id: string, payload: MachinePayload) {
  const response = await http.put<ApiResponse<MachineDto>>(`/machine-models/${id}`, payload);
  return toMachine(response.data.data);
}

export async function setMachineActive(id: string, isActive: boolean) {
  // DELETE deactivates on the server; reactivating is a normal partial update.
  if (isActive) {
    await http.put(`/machine-models/${id}`, { isActive: true });
  } else {
    await http.delete(`/machine-models/${id}`);
  }
}
