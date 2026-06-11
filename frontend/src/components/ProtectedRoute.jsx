import { Navigate, Outlet } from "react-router-dom";

import { roleHome, useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ roles }) {
  const access = useAuthStore((state) => state.access);
  const user = useAuthStore((state) => state.user);

  if (!access || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}
