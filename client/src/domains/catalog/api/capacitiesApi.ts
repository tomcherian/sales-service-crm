import { http } from "@/shared/api/http";
import { toPage } from "@/shared/api/mappers";
import type { ApiResponse, ListParams } from "@/shared/api/types";
import type { Capacity } from "../model/types";

// Shape of a capacity document as the server sends it.
interface CapacityDto {
  _id: string;
  capacityKg: number;
}

function toCapacity(dto: CapacityDto): Capacity {
  return { id: dto._id, capacityKg: dto.capacityKg };
}

export async function listCapacities(params: ListParams) {
  const response = await http.get<ApiResponse<CapacityDto[]>>("/machine-capacities", {
    params,
  });
  return toPage(response.data, toCapacity);
}

export async function createCapacity(capacityKg: number) {
  const response = await http.post<ApiResponse<CapacityDto>>("/machine-capacities", {
    capacityKg,
  });
  return toCapacity(response.data.data);
}

export async function deleteCapacity(id: string) {
  await http.delete(`/machine-capacities/${id}`);
}
