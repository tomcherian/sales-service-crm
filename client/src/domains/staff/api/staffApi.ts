import { http } from "@/shared/api/http";
import { refId, toPage } from "@/shared/api/mappers";
import type { ApiResponse, ListParams, RefDto } from "@/shared/api/types";
import type { UserRole } from "@/domains/auth";
import type { Employee, StaffRole } from "../model/types";

// Shape of a user document as the server sends it.
interface EmployeeDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  teamLead?: RefDto;
}

export interface EmployeePayload {
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  password?: string;
  teamLead?: string;
}

function toEmployee(dto: EmployeeDto): Employee {
  return {
    id: dto._id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: dto.role,
    isActive: dto.isActive,
    teamLeadId: refId(dto.teamLead),
  };
}

export async function listEmployees(params: ListParams & { role: StaffRole }) {
  const response = await http.get<ApiResponse<EmployeeDto[]>>("/employees", {
    params,
  });
  return toPage(response.data, toEmployee);
}

export async function createEmployee(payload: EmployeePayload) {
  const response = await http.post<ApiResponse<EmployeeDto>>("/employees", payload);
  return toEmployee(response.data.data);
}

export async function updateEmployee(id: string, payload: EmployeePayload) {
  const response = await http.put<ApiResponse<EmployeeDto>>(`/employees/${id}`, payload);
  return toEmployee(response.data.data);
}

export async function deactivateEmployee(id: string) {
  const response = await http.delete<ApiResponse<EmployeeDto>>(`/employees/${id}`);
  return toEmployee(response.data.data);
}
