export type UserRole = "admin" | "team_lead" | "salesperson" | "maintenance";

/** The signed-in employee, as returned by /auth/login and /auth/me. */
export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}
