import type { ReactElement } from "react";
import { CustomersPage } from "@/domains/customers";
import { DashboardPage } from "@/domains/dashboard";
import { StaffPage } from "@/domains/staff";

export interface NavItem {
  path: string;
  label: string;
  element: ReactElement;
  adminOnly: boolean;
}

// Single source for both the router and the drawer, in drawer order.
export const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", element: <DashboardPage />, adminOnly: false },
  { path: "/team-leads", label: "Team Leads", element: <StaffPage role="team_lead" />, adminOnly: true },
  { path: "/salespersons", label: "Salespersons", element: <StaffPage role="salesperson" />, adminOnly: true },
  { path: "/maintenance", label: "Maintenance Staff", element: <StaffPage role="maintenance" />, adminOnly: true },
  { path: "/customers", label: "Customers", element: <CustomersPage />, adminOnly: true },
];
