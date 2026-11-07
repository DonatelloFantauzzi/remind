import { Link } from "react-router";

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Re:Mind</h1>
      <p className="text-muted">I tuoi appunti, diventati una mappa.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/login"
          className="rounded-lg bg-primary px-6 py-2.5 text-center font-medium text-fg hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          Accedi
        </Link>
        <Link
          to="/register"
          className="rounded-lg border border-line px-6 py-2.5 text-center font-medium text-fg hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          Registrati
        </Link>
      </div>
    </main>
  );
}
