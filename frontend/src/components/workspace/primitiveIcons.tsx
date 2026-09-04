import {
  BookIcon,
  ScaleIcon,
  FileTextIcon,
  TrendingUpIcon,
  LandmarkIcon,
  ClipboardCheckIcon,
  ArrowLeftRightIcon,
  BoxIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** One icon per accounting primitive, shared by the composer, chips and filters. */
export const primitiveIcons: Record<string, LucideIcon> = {
  'journal-entries': BookIcon,
  'account-mapping': ArrowLeftRightIcon,
  reconciliation: ScaleIcon,
  'rev-rec': FileTextIcon,
  flux: TrendingUpIcon,
  'tax-provision': LandmarkIcon,
  'audit-workpapers': ClipboardCheckIcon,
}

export function primitiveIcon(id: string): LucideIcon {
  return primitiveIcons[id] ?? BoxIcon
}
