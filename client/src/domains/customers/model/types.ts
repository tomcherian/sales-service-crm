export type CustomerType = "retail" | "wholesale";

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  assignedSalespersonId?: string;
  notes?: string;
}

export const customerTypeLabels: Record<CustomerType, string> = {
  retail: "Retail",
  wholesale: "Wholesale",
};
