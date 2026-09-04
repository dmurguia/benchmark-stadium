import type { Project } from '../types/arena'

export const recentSearches = [
  'ASC 606 reseller right of return',
  'deferred revenue swing',
  'LedgerPilot reconciliation score',
  'payroll accrual across periods',
]

export const projectStatusLabels: Record<Project['status'], string> = {
  'in-review': 'In review',
  calibrated: 'Calibrated',
  complete: 'Complete',
}
