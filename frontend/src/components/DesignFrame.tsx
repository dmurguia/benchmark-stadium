interface Props {
  battleId: string;
  position: number;
  title: string;
  className?: string;
}

/** Sandboxed viewer for one generated design. Scripts allowed (games need
 * them); same-origin deliberately withheld so content can't touch our app. */
export default function DesignFrame({ battleId, position, title, className = "" }: Props) {
  return (
    <iframe
      title={title}
      src={`/api/battles/${battleId}/generations/${position}/html`}
      sandbox="allow-scripts"
      className={`h-full w-full border-0 bg-white ${className}`}
    />
  );
}
