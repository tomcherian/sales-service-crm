import type { UserRole } from "@/domains/auth";

/** Roles managed on the staff pages. Admins are not listed or created there. */
export type StaffRole = Exclude<UserRole, "admin">;

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  teamLeadId?: string;
}

export const staffRoleLabels: Record<StaffRole, string> = {
  team_lead: "Team Lead",
  salesperson: "Salesperson",
  maintenance: "Maintenance Staff",
};
