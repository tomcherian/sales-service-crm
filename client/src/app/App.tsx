import { Fragment } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/domains/auth";
import { AppLayout } from "./layout/AppLayout";
import { navItems } from "./navigation";
import { AdminRoute } from "./routing/AdminRoute";
import { ProtectedRoute } from "./routing/ProtectedRoute";

// Each page's key forces a remount, so StaffPage doesn't carry paging or search state between roles.
function renderRoute({ path, element }: (typeof navItems)[number]) {
  return path === "/" ? (
    <Route key={path} index element={element} />
  ) : (
    <Route key={path} path={path.slice(1)} element={<Fragment key={path}>{element}</Fragment>} />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {navItems.filter((item) => !item.adminOnly).map(renderRoute)}
          <Route element={<AdminRoute />}>
            {navItems.filter((item) => item.adminOnly).map(renderRoute)}
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
