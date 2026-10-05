export type UserRole = "admin" | "team_lead" | "salesperson" | "maintenance";
export type CustomerType = "retail" | "wholesale";

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}

export interface Employee extends Omit<User, "companyId"> {
  _id: string;
  teamLead?: string | null | Pick<Employee, "_id" | "name" | "email">;
}

export interface Customer {
  _id: string;
  id?: string;
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  assignedSalesperson?: string | null | Pick<Employee, "_id" | "name" | "email">;
  notes?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}
