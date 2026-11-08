import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "./authStore";

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const checked = useAuthStore((state) => state.checked);

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p role="status" className="text-sm text-muted">
          Caricamento…
        </p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
