import { MaximizeIcon } from "lucide-react";

/** A work-product document panel: the design's paper chrome around the
 * sandboxed iframe that renders the generated (or trap) document. */
export function DocPanel({
  battleId,
  position,
  label,
  onExpand,
}: {
  battleId: string;
  position: number;
  label: string;
  onExpand?: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-card shadow-whisper">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{label}</h3>
        {onExpand ? (
          <button
            type="button"
            aria-label={`Expand ${label}`}
            onClick={onExpand}
            className="rounded-md p-1 text-muted transition-colors hover:bg-panel hover:text-ink"
          >
            <MaximizeIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <iframe
        title={label}
        sandbox="allow-scripts"
        src={`/api/battles/${battleId}/generations/${position}/html`}
        className="h-full w-full flex-1 border-0 bg-white"
      />
    </article>
  );
}

export function DocModal({
  battleId,
  position,
  label,
  onClose,
}: {
  battleId: string;
  position: number;
  label: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-hairline bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{label}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline px-3 py-1 text-[13px] font-semibold text-ink hover:bg-panel"
          >
            Close
          </button>
        </div>
        <iframe
          title={`${label} expanded`}
          sandbox="allow-scripts"
          src={`/api/battles/${battleId}/generations/${position}/html`}
          className="h-full w-full flex-1 border-0 bg-white"
        />
      </div>
    </div>
  );
}
