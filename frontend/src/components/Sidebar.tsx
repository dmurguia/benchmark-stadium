import { HistoryIcon, LogInIcon, LogOutIcon, ScaleIcon, TrophyIcon, UserRoundIcon } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { VERTICAL_LABELS } from "../lib/view";
import { Chip } from "./ui";

const NAV = [
  { to: "/", label: "Judge", icon: ScaleIcon, end: true },
  { to: "/leaderboards", label: "Leaderboards", icon: TrophyIcon },
  { to: "/sessions", label: "My Sessions", icon: HistoryIcon },
  { to: "/record", label: "My Record", icon: UserRoundIcon },
];

function initials(name: string) {
  return name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
}

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[220px] flex-col border-r border-hairline bg-panel">
      <div className="px-5 pb-6 pt-6">
        <div className="flex items-start gap-2">
          <span aria-hidden="true" className="text-lg leading-none">
            🏟️
          </span>
          <div>
            <p className="text-[15px] font-extrabold leading-tight tracking-tight text-ink">
              Benchmark
              <br />
              Stadium
            </p>
            <span className="mt-2 inline-flex rounded-full border border-hairline bg-card px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
              Prototype
            </span>
          </div>
        </div>
      </div>

      <nav aria-label="Primary" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? "bg-card text-ink shadow-whisper" : "text-muted hover:bg-card/60 hover:text-ink"
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-hairline p-4">
        {user ? (
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-[13px] font-bold text-paper"
              >
                {initials(user.display_name || user.email)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink">{user.display_name || user.email}</p>
                <p className="truncate text-[11px] text-muted">
                  {user.role || "Reviewer"}
                  {user.vertical ? ` · ${VERTICAL_LABELS[user.vertical] ?? user.vertical}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 flex w-full items-center gap-2 rounded-lg border border-hairline bg-card px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
            >
              <LogOutIcon className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <Link
              to="/signin"
              className="flex w-full items-center gap-2 rounded-lg border border-hairline bg-card px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
            >
              <LogInIcon className="h-4 w-4" aria-hidden="true" />
              Sign in
            </Link>
            <p className="mt-2 text-[11px] leading-snug text-muted">
              Judging as a guest. Votes count once verified.
            </p>
          </div>
        )}
        <div className="mt-3">
          <Chip tone="neutral">Season · Q3 2026</Chip>
        </div>
      </div>
    </aside>
  );
}
