import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { CustomersPage } from "./features/CustomersPage";
import { DashboardPage } from "./features/DashboardPage";
import { EmployeesPage } from "./features/EmployeePage";
import { LoginPage } from "./features/LoginPage";

function AdminOnly() {
  const { user } = useAuth();
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<AdminOnly />}>
            <Route
              path="team-leads"
              element={<EmployeesPage role="team_lead" />}
            />
            <Route
              path="salespersons"
              element={<EmployeesPage role="salesperson" />}
            />
            <Route
              path="maintenance"
              element={<EmployeesPage role="maintenance" />}
            />
            <Route path="customers" element={<CustomersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
