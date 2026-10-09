import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/domains/auth";

// UI convenience only: the API enforces admin access on its own.
export function AdminRoute() {
  const { user } = useAuth();
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
