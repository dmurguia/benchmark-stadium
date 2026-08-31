import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Nav() {
  const { user, signOut } = useAuth();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm transition ${isActive ? "bg-ink-800 text-white" : "text-ink-400 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-arena text-base">⚔️</span>
          Design Arena
          <span className="rounded-full border border-ink-700 px-2 py-0.5 text-[10px] font-normal uppercase tracking-widest text-ink-400">
            recreation
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navCls} end>
            Create
          </NavLink>
          <NavLink to="/leaderboard" className={navCls}>
            Leaderboard
          </NavLink>
          {user && (
            <NavLink to="/history" className={navCls}>
              My battles
            </NavLink>
          )}
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <span className="hidden text-sm text-ink-400 sm:inline">{user.display_name}</span>
              <button onClick={signOut} className="rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-ink-200 hover:border-ink-600">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="ml-3 rounded-lg bg-arena px-4 py-1.5 text-sm font-semibold hover:bg-arena-bright">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
