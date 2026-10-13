import type { ReactElement } from "react";
import { CapacitiesPage, MachinesPage, MakesPage } from "@/domains/catalog";
import { CustomersPage } from "@/domains/customers";
import { DashboardPage } from "@/domains/dashboard";
import { StaffPage } from "@/domains/staff";

export interface NavItem {
  path: string;
  label: string;
  element: ReactElement;
  adminOnly: boolean;
  /** Items sharing a group are shown as sub-items under one collapsible drawer entry. */
  group?: string;
}

// Single source for both the router and the drawer, in drawer order.
export const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", element: <DashboardPage />, adminOnly: false },
  { path: "/team-leads", label: "Team Leads", element: <StaffPage role="team_lead" />, adminOnly: true },
  { path: "/salespersons", label: "Salespersons", element: <StaffPage role="salesperson" />, adminOnly: true },
  { path: "/maintenance", label: "Maintenance Staff", element: <StaffPage role="maintenance" />, adminOnly: true },
  { path: "/customers", label: "Customers", element: <CustomersPage />, adminOnly: true },
  { path: "/master-data/makes", label: "Makes", element: <MakesPage />, adminOnly: true, group: "Master Data" },
  { path: "/master-data/capacities", label: "Capacities", element: <CapacitiesPage />, adminOnly: true, group: "Master Data" },
  { path: "/master-data/machines", label: "Machines", element: <MachinesPage />, adminOnly: true, group: "Master Data" },
];
