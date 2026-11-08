import { useAuthStore } from "../features/auth/authStore";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <aside className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3 md:min-h-screen md:w-64 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:py-6">
      <span className="text-lg font-semibold text-fg">Re:Mind</span>

      <nav aria-label="Navigazione" className="hidden md:block md:flex-1">
        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted">
          Navigazione
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          <li className="rounded-md bg-elevated px-2 py-1.5 text-fg">Grafo</li>
          <li className="rounded-md px-2 py-1.5 text-muted">Assistente</li>
          <li className="rounded-md px-2 py-1.5 text-muted">Ricerca</li>
          <li className="rounded-md px-2 py-1.5 text-muted">Timeline</li>
        </ul>
      </nav>

      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg hover:bg-elevated focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
      >
        Esci
      </button>
    </aside>
  );
}
