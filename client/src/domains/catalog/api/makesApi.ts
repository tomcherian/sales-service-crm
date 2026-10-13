import { http } from "@/shared/api/http";
import { toPage } from "@/shared/api/mappers";
import type { ApiResponse, ListParams } from "@/shared/api/types";
import type { Make } from "../model/types";

// Shape of a make document as the server sends it.
interface MakeDto {
  _id: string;
  name: string;
  companyName?: string;
  country?: string;
  isActive: boolean;
}

export interface MakePayload {
  name: string;
  companyName?: string;
  country?: string;
}

function toMake(dto: MakeDto): Make {
  return {
    id: dto._id,
    name: dto.name,
    companyName: dto.companyName,
    country: dto.country,
    isActive: dto.isActive,
  };
}

export async function listMakes(params: ListParams & { isActive?: boolean }) {
  const response = await http.get<ApiResponse<MakeDto[]>>("/machine-makes", { params });
  return toPage(response.data, toMake);
}

export async function createMake(payload: MakePayload) {
  const response = await http.post<ApiResponse<MakeDto>>("/machine-makes", payload);
  return toMake(response.data.data);
}

export async function updateMake(id: string, payload: MakePayload) {
  const response = await http.put<ApiResponse<MakeDto>>(`/machine-makes/${id}`, payload);
  return toMake(response.data.data);
}

export async function setMakeActive(id: string, isActive: boolean) {
  // DELETE deactivates on the server; reactivating is a normal partial update.
  if (isActive) {
    await http.put(`/machine-makes/${id}`, { isActive: true });
  } else {
    await http.delete(`/machine-makes/${id}`);
  }
}
