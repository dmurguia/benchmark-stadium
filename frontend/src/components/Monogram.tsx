interface Props {
  name: string;
  size?: number;
  className?: string;
}

function hueOf(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

/** Deterministic colored monogram — stands in for org/model logos. */
export default function Monogram({ name, size = 36, className = "" }: Props) {
  const hue = hueOf(name);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-display font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue},70%,52%), hsl(${(hue + 40) % 360},75%,42%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
