import { http } from "@/shared/api/http";
import { refId, toPage } from "@/shared/api/mappers";
import type { ApiResponse, ListParams, RefDto } from "@/shared/api/types";
import type { Customer, CustomerType } from "../model/types";

// Shape of a customer document as the server sends it.
interface CustomerDto {
  _id: string;
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  assignedSalesperson?: RefDto;
  notes?: string;
}

export interface CustomerPayload {
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  assignedSalesperson?: string;
  notes?: string;
}

function toCustomer(dto: CustomerDto): Customer {
  return {
    id: dto._id,
    name: dto.name,
    type: dto.type,
    email: dto.email,
    phone: dto.phone,
    country: dto.country,
    city: dto.city,
    address: dto.address,
    assignedSalespersonId: refId(dto.assignedSalesperson),
    notes: dto.notes,
  };
}

export async function listCustomers(params: ListParams & { type?: CustomerType }) {
  const response = await http.get<ApiResponse<CustomerDto[]>>("/customers", {
    params,
  });
  return toPage(response.data, toCustomer);
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await http.post<ApiResponse<CustomerDto>>("/customers", payload);
  return toCustomer(response.data.data);
}

export async function updateCustomer(id: string, payload: CustomerPayload) {
  const response = await http.put<ApiResponse<CustomerDto>>(`/customers/${id}`, payload);
  return toCustomer(response.data.data);
}

export async function deleteCustomer(id: string) {
  await http.delete(`/customers/${id}`);
}
