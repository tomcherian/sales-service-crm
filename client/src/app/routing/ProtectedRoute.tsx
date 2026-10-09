import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "@/domains/auth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
