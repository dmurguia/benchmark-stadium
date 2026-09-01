// View types for the board components. In the Magic Patterns mock these came
// with hardcoded rows; the real rows are mapped from the API in lib/view.ts.

export type Competitor = {
  rank: number;
  delta: number;
  name: string;
  org: string;
  isProduct?: boolean;
  provenance?: string;
  score: number;
  ci: string;
  judgments: number;
  winRate: number;
};

export type EmptyChair = {
  name: string;
  org: string;
  note: string;
};

export type ReleaseMovementView = {
  board: string;
  from: number;
  to: number;
};

export type ReleaseView = {
  id: number;
  competitor: string;
  label: string;
  org: string;
  date: string;
  reruns: string;
  movements: ReleaseMovementView[];
};
