// Demo content for record-page surfaces the backend doesn't serve yet
// (open engagements, badge requirements, the monthly trend). Live reviewer
// numbers come from /api/auth/reviewer and are mapped in pages/MyRecord.tsx.

export const badgeLadder = [
  {
    name: 'Apprentice',
    requirement: '10 judgments',
  },
  {
    name: 'Calibrated Reviewer',
    requirement: '85%+ calibration over 40 judgments',
  },
  {
    name: 'Lead Reviewer',
    requirement: '93%+ calibration over 120 judgments',
  },
]

export const calibrationTrend = [
  { label: 'Apr', value: 74 },
  { label: 'May', value: 79 },
  { label: 'Jun', value: 83 },
  { label: 'Jul', value: 88 },
  { label: 'Aug', value: 90 },
  { label: 'Sep', value: 92 },
]

export const engagements = [
  {
    title: 'Revenue recognition rubric panel',
    detail: 'ASC 606 edge cases · 6 hrs · remote · $1,800',
    window: 'Applications close Sep 14',
  },
  {
    title: 'Legacy-ERP migration review',
    detail: 'Account mapping audit · 10 hrs · remote · $2,750',
    window: 'Applications close Sep 22',
  },
]
