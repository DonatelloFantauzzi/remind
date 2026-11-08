import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "./authStore";

export default function GuestRoute() {
  const checked = useAuthStore((state) => state.checked);
  const user = useAuthStore((state) => state.user);

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p role="status" className="text-sm text-muted">
          Caricamento…
        </p>
      </main>
    );
  }
  if (user) {
    return <Navigate to="/graph" replace />;
  }

  return <Outlet />;
}
