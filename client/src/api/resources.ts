import { http } from "./http";
import type {
  ApiResponse,
  Customer,
  Employee,
  PageMeta,
  UserRole,
  CustomerType,
} from "../types";

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export async function listEmployees(params: {
  page: number;
  limit: number;
  search: string;
  role: UserRole;
}) {
  const response = await http.get<ApiResponse<Employee[]>>("/employees", {
    params,
  });
  if (!response.data.meta) {
    throw new Error("Employee list response is missing pagination metadata");
  }
  return { items: response.data.data, meta: response.data.meta };
}

export async function saveEmployee(
  id: string | undefined,
  values: Record<string, unknown>,
) {
  const response = id
    ? await http.put<ApiResponse<Employee>>(`/employees/${id}`, values)
    : await http.post<ApiResponse<Employee>>("/employees", values);
  return response.data.data;
}

export async function deactivateEmployee(id: string) {
  const response = await http.delete<ApiResponse<Employee>>(`/employees/${id}`);
  return response.data.data;
}

export async function listCustomers(params: {
  page: number;
  limit: number;
  search: string;
  type?: CustomerType;
}) {
  const response = await http.get<ApiResponse<Customer[]>>("/customers", {
    params,
  });
  if (!response.data.meta) {
    throw new Error("Customer list response is missing pagination metadata");
  }
  return { items: response.data.data, meta: response.data.meta };
}

export async function saveCustomer(
  id: string | undefined,
  values: Record<string, unknown>,
) {
  const response = id
    ? await http.put<ApiResponse<Customer>>(`/customers/${id}`, values)
    : await http.post<ApiResponse<Customer>>("/customers", values);
  return response.data.data;
}

export async function deleteCustomer(id: string) {
  const response = await http.delete<ApiResponse<Customer>>(`/customers/${id}`);
  return response.data.data;
}
