export interface Primitive {
  id: string
  label: string
  /** Short form used in chips and filter rows. */
  short: string
  blurb: string
  available: boolean
  /** Backend category slug — present only when a live board exists for it. */
  category?: string
  /** Fallback scenario suggestions when the live list hasn't loaded. */
  scenarios: string[]
}

// Availability tracks the live backend boards (journal-entry, coa-mapping);
// the rest are the roadmap, shown locked. Demo boards for some locked
// primitives still exist in data/competitors.ts for preview-only surfaces.
export const primitives: Primitive[] = [
  {
    id: 'journal-entries',
    label: 'Journal Entries',
    short: 'Journal Entries',
    blurb: 'Draft and support a GAAP journal entry for a described transaction.',
    available: true,
    category: 'journal-entry',
    scenarios: [
      'a Q3 accrual for unbilled professional services',
      'a customer deposit received before delivery',
      'a payroll accrual spanning two periods',
    ],
  },
  {
    id: 'account-mapping',
    label: 'Account Mapping',
    short: 'Acct. Mapping',
    blurb: 'Map a legacy chart of accounts onto a target ERP structure.',
    available: true,
    category: 'coa-mapping',
    scenarios: [
      'a legacy-ERP migration with remapped accounts',
      'a subsidiary COA folded into the parent chart',
      'a departmental rollup with mismatched account codes',
    ],
  },
  {
    id: 'reconciliation',
    label: 'Account Reconciliation',
    short: 'Reconciliation',
    blurb: 'Reconcile a GL account against a source ledger. Opens next season.',
    available: false,
    scenarios: [],
  },
  {
    id: 'rev-rec',
    label: 'Revenue Recognition',
    short: 'Revenue Rec.',
    blurb: 'Write the treatment memo for a described contract under ASC 606. Opens next season.',
    available: false,
    scenarios: [],
  },
  {
    id: 'flux',
    label: 'Flux Analysis',
    short: 'Flux Analysis',
    blurb: 'Explain a period-over-period variance in an account or line item. Opens next season.',
    available: false,
    scenarios: [],
  },
  {
    id: 'tax-provision',
    label: 'Tax Provision',
    short: 'Tax Provision',
    blurb: 'Compute and support an interim tax provision. Opens next season.',
    available: false,
    scenarios: [],
  },
]

export const activePrimitives = primitives.filter((p) => p.available)

export function primitiveById(id: string): Primitive {
  return primitives.find((p) => p.id === id) ?? primitives[0]
}

export function primitiveByCategory(category: string): Primitive | undefined {
  return primitives.find((p) => p.category === category)
}
