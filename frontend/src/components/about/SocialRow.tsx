import { BookOpenIcon, MessagesSquareIcon, LinkedinIcon, MailIcon } from 'lucide-react'

const links = [
  { label: 'The Journal', icon: BookOpenIcon },
  { label: 'X', icon: MessagesSquareIcon },
  { label: 'LinkedIn', icon: LinkedinIcon },
  { label: 'Reviewer community', icon: MailIcon },
]

export function SocialRow() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2.5">
      {links.map(({ label, icon: Icon }) => (
        <li key={label}>
          <a
            href="#about-top"
            className="flex items-center gap-2 rounded-full border border-hairline bg-card px-3.5 py-2 text-[12.5px] font-semibold text-ink transition-colors duration-150 ease-out hover:border-ink/35"
          >
            <Icon className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
}
