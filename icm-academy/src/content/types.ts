export type DemoId =
  | 'compare'
  | 'ctxwindow'
  | 'layers'
  | 'classify'
  | 'tree'
  | 'contract'
  | 'pipeline'
  | 'ushape'
  | 'decision';

export type DogfoodId = 'workflow' | 'stages' | 'references' | 'contracts' | 'gates' | 'sourcefix';

interface Base {
  title: string;
  /** concept ids from coverage.ts that this card teaches */
  tags?: string[];
  /** where it comes from: paper section, or "video" for secondary material */
  src?: string;
}

export interface IdeaCard extends Base {
  kind: 'idea';
  body: string;
  /** a one-line "so what" for people building their own harness */
  harness?: string;
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
export type Card = IdeaCard | QuizCard | DemoCard | DogfoodCard;

export interface Module {
  id: string;
  num: string;
  title: string;
  tagline: string;
  minutes: number;
  cards: Card[];
}
