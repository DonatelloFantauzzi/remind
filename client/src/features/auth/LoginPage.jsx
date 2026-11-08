// client/src/features/auth/LoginPage.jsx
import { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "./authStore";

function LoginPage() {
  // la logica è tua: stato dei campi, errore, invio
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      return;
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-fg">Accedi</h1>
        <p className="mt-2 text-sm text-muted">
          Entra nel tuo spazio di appunti.
        </p>

        {/* fase 2, passo 6: qui arrivano i pulsanti Google e GitHub */}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-fg">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              required
              placeholder="nome@esempio.it"
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2.5 text-fg placeholder:text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-fg">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border border-line bg-surface px-3 py-2.5 text-fg placeholder:text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 font-medium text-fg hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
          >
            Accedi
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Non hai un account?{" "}
          <Link
            to="/register"
            className="font-medium text-secondary hover:underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
