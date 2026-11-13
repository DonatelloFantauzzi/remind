import { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "./authStore";
import request from "../../api/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    let nameForBody = !name.trim() ? undefined : name.trim();
    try {
      await request("/auth/register", {
        method: "POST",
        body: { email, password, name: nameForBody },
      });
      await login(email, password);
    } catch (err) {
      setError(err.message);
      return;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-fg mb-6">Crea un account</h1>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="/api/auth/google"
            className="flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 font-medium text-fg hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Continua con Google
          </a>
          {/* qui arriverà GitHub */}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs uppercase tracking-wide text-muted">
            oppure
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-muted">
              Nome <span className="text-muted/70">(facoltativo)</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-surface border border-line px-3 py-2 text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-surface border border-line px-3 py-2 text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg bg-surface border border-line px-3 py-2 text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <p className="text-xs text-muted">Almeno 8 caratteri</p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-fg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            Crea account
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Hai già un account?{" "}
          <Link to="/login" className="text-secondary hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </main>
  );
}
