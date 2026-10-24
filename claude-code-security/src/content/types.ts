export type DemoId =
  | 'ladder'
  | 'bypass'
  | 'modes'
  | 'hooksim'
  | 'sandbox'
  | 'envs'
  | 'trust'
  | 'xcode'
  | 'iosenv'
  | 'xcodesandbox'
  | 'iosrules'
  | 'traffic'
  | 'routes'
  | 'leaves';

export type DogfoodId = 'profile' | 'rules' | 'mode' | 'hooks' | 'sandbox' | 'ios' | 'offline';

export type Track = 'core' | 'ios' | 'offline';

interface Base {
  title: string;
  /** concept ids from coverage.ts that this card teaches */
  tags?: string[];
  /** key(s) into SOURCES (sources.ts): where the claims on this card come from, shown as chips on the card */
  src?: string | string[];
  /** behaviour that changes fast or comes from secondhand reports: check it on your own setup */
  verify?: boolean;
}

export interface IdeaCard extends Base {
  kind: 'idea';
  body: string;
  /** optional config or shell snippet */
  code?: string;
  /** a one-line "so what" for your own setup */
  guard?: string;
}
/** Side-by-side: what stays the same and what differs (used heavily in the iOS track). */
export interface DiffCard extends Base {
  kind: 'diff';
  body?: string;
  left: string;
  right: string;
  same: string[];
  different: [string, string][];
}
export interface QuizCard extends Base {
  kind: 'quiz';
  options: string[];
  answer: number;
  why: string;
}
export interface DemoCard extends Base {
  kind: 'demo';
  demo: DemoId;
  body: string;
}
export interface DogfoodCard extends Base {
  kind: 'dogfood';
  step: DogfoodId;
  body: string;
}
export type Card = IdeaCard | DiffCard | QuizCard | DemoCard | DogfoodCard;

export interface ModuleMeta {
  /** source file in src/content holding this module's cards */
  file: string;
  id: string;
  num: string;
  track: Track;
  title: string;
  tagline: string;
  minutes: number;
  /** number of cards, kept in sync by `npm run check` */
  count: number;
}

export interface Module extends ModuleMeta {
  cards: Card[];
}
