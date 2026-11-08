import { Navigate, Route, Routes } from "react-router";
import { useAuthStore } from "./features/auth/authStore";
import { useEffect } from "react";
import LandingPage from "./features/landing/LandingPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import GraphPage from "./features/graph/GraphPage";
import GuestRoute from "./features/auth/GuestRoute";

function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/graph" element={<GraphPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
