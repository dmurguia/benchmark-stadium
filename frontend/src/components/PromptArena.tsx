import { motion } from "framer-motion";
import {
  ArrowUpIcon,
  BookOpenIcon,
  CalculatorIcon,
  FileCheckIcon,
  FileSignatureIcon,
  HandshakeIcon,
  NetworkIcon,
  PaperclipIcon,
  ReceiptIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  UploadCloudIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type BattleOut } from "../lib/api";

type WorkType = {
  id: string;
  label: string;
  icon: typeof FileSignatureIcon;
  vertical: "Legal" | "Finance/ERP";
  // The real category this work type battles in (nearby types share a board).
  category: string;
  prompt: string;
};

const WORK_TYPES: WorkType[] = [
  {
    id: "contract-redline",
    label: "Contract Redline",
    icon: FileSignatureIcon,
    vertical: "Legal",
    category: "contract-redline",
    prompt: "Redline this vendor NDA — we're the receiving party.",
  },
  {
    id: "clause-risk",
    label: "Clause Risk Review",
    icon: ShieldAlertIcon,
    vertical: "Legal",
    category: "clause-risk",
    prompt: "Rank the risk in this counterparty draft and tell me what to push back on.",
  },
  {
    id: "mutual-nda",
    label: "Mutual NDA",
    icon: HandshakeIcon,
    vertical: "Legal",
    category: "contract-redline",
    prompt: "Balance this NDA for a mutual posture ahead of acquisition talks.",
  },
  {
    id: "msa-review",
    label: "MSA Review",
    icon: FileCheckIcon,
    vertical: "Legal",
    category: "clause-risk",
    prompt: "Review the liability cap and indemnity in this master services agreement.",
  },
  {
    id: "journal-entries",
    label: "Journal Entries",
    icon: BookOpenIcon,
    vertical: "Finance/ERP",
    category: "journal-entry",
    prompt: "Draft the journal entries for a deferred revenue release.",
  },
  {
    id: "account-mapping",
    label: "Account Mapping",
    icon: NetworkIcon,
    vertical: "Finance/ERP",
    category: "coa-mapping",
    prompt: "Map these vendor invoices to the right GL accounts and dimensions.",
  },
  {
    id: "accrual-memo",
    label: "Accrual Memo",
    icon: ScrollTextIcon,
    vertical: "Finance/ERP",
    category: "journal-entry",
    prompt: "Write the support memo for our Q3 accrual position.",
  },
  {
    id: "revenue-recognition",
    label: "Revenue Recognition",
    icon: ReceiptIcon,
    vertical: "Finance/ERP",
    category: "journal-entry",
    prompt: "Assess the ASC 606 treatment for this multi-element contract.",
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    icon: CalculatorIcon,
    vertical: "Finance/ERP",
    category: "coa-mapping",
    prompt: "Reconcile the intercompany balances and explain the variances.",
  },
];

const ROTATING = [
  "Redline this vendor NDA, we're the receiving party…",
  "Draft the journal entries for a deferred revenue release…",
  "Rank the risk in this counterparty MSA…",
  "Map these invoices to the right GL accounts…",
];

const FLOATING = [
  { name: "Claude Opus 4.8", tone: "moss", className: "left-[-40px] top-[38%]", pointer: "left" as const, delay: 0 },
  { name: "GLM 5.2", tone: "sky", className: "right-[-52px] top-[24%]", pointer: "right" as const, delay: 0.6 },
  {
    name: "GPT-5.5",
    tone: "rust",
    className: "bottom-[-34px] left-1/2 -translate-x-1/2",
    pointer: "bottom" as const,
    delay: 1.2,
  },
];

const TONES: Record<string, string> = {
  moss: "bg-moss-tint text-forest border-[#c3d2bf]",
  sky: "bg-[#e3ebee] text-[#3c5560] border-[#c6d5da]",
  rust: "bg-rust-tint text-rust border-[#e0c4b9]",
};

/** Route a free-text description of the work to the closest board. */
function matchCategory(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/(risk|clause|indemn|liabilit|push back|msa)/.test(p)) return "clause-risk";
  if (/(nda|redline|contract|agreement|term sheet)/.test(p)) return "contract-redline";
  if (/(map|chart of accounts|coa|gl account|migrat|reconcil)/.test(p)) return "coa-mapping";
  if (/(journal|entry|entries|accrual|revenue|deferr|posting|month.?end)/.test(p)) return "journal-entry";
  return "contract-redline";
}

function useTypedPlaceholder(active: boolean) {
  const [text, setText] = useState("");
  const state = useRef({ line: 0, char: 0, deleting: false });

  useEffect(() => {
    if (!active) return;
    let timeout: number;
    const tick = () => {
      const s = state.current;
      const full = ROTATING[s.line];
      if (!s.deleting) {
        s.char += 1;
        setText(full.slice(0, s.char));
        if (s.char >= full.length) {
          s.deleting = true;
          timeout = window.setTimeout(tick, 2200);
          return;
        }
        timeout = window.setTimeout(tick, 26);
      } else {
        s.char -= 8;
        if (s.char <= 0) {
          s.char = 0;
          s.deleting = false;
          s.line = (s.line + 1) % ROTATING.length;
        }
        setText(full.slice(0, Math.max(s.char, 0)));
        timeout = window.setTimeout(tick, 18);
      }
    };
    timeout = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timeout);
  }, [active]);

  return text;
}

export function PromptArena() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typed = useTypedPlaceholder(prompt.length === 0 && !focused);

  const active = WORK_TYPES.find((w) => w.id === selected) ?? null;

  const start = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const category = active ? active.category : matchCategory(prompt);
    try {
      const battle = await api<BattleOut>("/api/battles", {
        method: "POST",
        body: JSON.stringify({ category, scenario_id: null }),
      });
      navigate(`/judge/${battle.public_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not stage the session.");
      setBusy(false);
    }
  };

  return (
    <section className="relative pb-16 pt-2 text-center">
      <div className="relative mx-auto max-w-3xl">
        {FLOATING.map((tag) => (
          <motion.div
            key={tag.name}
            aria-hidden="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: [0, -7, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: tag.delay },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: tag.delay },
            }}
            className={`pointer-events-none absolute z-10 hidden lg:block ${tag.className}`}
          >
            <span
              className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold shadow-whisper ${TONES[tag.tone]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {tag.name}
              <span
                className={`absolute h-2 w-2 rotate-45 ${TONES[tag.tone]} ${
                  tag.pointer === "left"
                    ? "-left-[3px] top-1/2 -translate-y-1/2"
                    : tag.pointer === "right"
                      ? "-right-[3px] top-1/2 -translate-y-1/2"
                      : "-bottom-[3px] left-1/2 -translate-x-1/2"
                }`}
              />
            </span>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative rounded-2xl border bg-card p-4 text-left transition-all duration-300 ${
            focused ? "border-forest shadow-[0_2px_18px_rgba(47,58,49,0.10)]" : "border-hairline shadow-whisper"
          }`}
        >
          <label htmlFor="work-prompt" className="sr-only">
            Describe the work you want judged
          </label>
          <textarea
            id="work-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={5}
            placeholder=" "
            className="w-full resize-none bg-transparent px-2 pt-2 text-[16px] leading-relaxed text-ink focus:outline-none"
          />
          {prompt.length === 0 && !focused ? (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-6 max-w-[85%] text-[16px] leading-relaxed text-muted"
            >
              {typed}
              <span className="ml-0.5 inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-muted" />
            </p>
          ) : null}

          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Attach a document (coming later — every matter here is synthetic)"
                title="Every matter here is synthetic — nothing confidential needed"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                <PaperclipIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Upload from your document store (coming later)"
                title="Every matter here is synthetic — nothing confidential needed"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                <UploadCloudIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              {active ? (
                <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-forest bg-moss-tint px-2.5 py-1 text-[11.5px] font-bold text-forest">
                  {active.vertical} · {active.label}
                </span>
              ) : null}
            </div>
            <motion.button
              type="button"
              onClick={start}
              disabled={busy}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Judge this"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-paper transition-colors hover:bg-forest-hover disabled:opacity-60"
            >
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
              ) : (
                <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </motion.div>
        {busy ? (
          <p className="mt-3 text-[13px] font-semibold text-muted">
            Staging the blind field — five drafts, authors hidden…
          </p>
        ) : null}
        {error ? <p className="mt-3 text-[13px] font-semibold text-rust">{error}</p> : null}
      </div>

      <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
        {WORK_TYPES.map((type, i) => {
          const Icon = type.icon;
          const isActive = selected === type.id;
          return (
            <motion.li
              key={type.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
            >
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setSelected(isActive ? null : type.id);
                  if (!isActive) setPrompt(type.prompt);
                }}
                className={`group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[13.5px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive ? "border-forest bg-moss-tint text-forest" : "border-hairline bg-card text-ink hover:border-forest/40"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md ${
                    isActive ? "bg-forest text-paper" : "bg-panel text-forest"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {type.label}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
