import { ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { Card, Chip, PageHeader } from "../components/ui";
import { api, type BattleSummaryOut } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CATEGORY_META } from "../lib/view";

export function MySessions() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<BattleSummaryOut[]>([]);

  useEffect(() => {
    if (!user) return;
    api<BattleSummaryOut[]>("/api/battles").then(setSessions).catch(() => {});
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="flex justify-center pt-10">
        <AuthCard eyebrow="My Sessions" title="Sign in to see your record." body="Your sessions are saved to your account the moment you verify." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Your judging history"
        title="My Sessions"
        description="Every session you have completed, with the comparisons that counted toward the boards."
      />

      {sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[14px] text-muted">
            No sessions yet.{" "}
            <Link to="/" className="font-bold text-forest hover:underline">
              Judge your first →
            </Link>
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-hairline">
            {sessions.map((session) => {
              const meta = CATEGORY_META[session.category];
              const complete = session.status === "complete";
              return (
                <li key={session.public_id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-[220px] flex-1">
                    <p className="line-clamp-1 text-[14.5px] font-bold text-ink">{session.prompt}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      {meta ? `${meta.vertical} · ${meta.label}` : session.category} ·{" "}
                      {new Date(session.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {complete ? (
                    <Chip tone="green">Champion: {session.winner_model?.name ?? "revealed"}</Chip>
                  ) : (
                    <Chip tone="neutral">In progress</Chip>
                  )}
                  <Link
                    to={complete ? `/reveal/${session.public_id}` : `/judge/${session.public_id}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-ink"
                  >
                    {complete ? "View reveal" : "Resume"} <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
