import SpotlightCard from '../vendor/react-bits/SpotlightCard.jsx';
import '../vendor/react-bits/SpotlightCard.css';
import { Rich } from '../lib/markup.jsx';
import CheckCard from './CheckCard.jsx';
import DogfoodAction from './DogfoodAction.jsx';
import StackVisual from './StackVisual.jsx';
import EngineVisual from './EngineVisual.jsx';
import TesterVisual from './TesterVisual.jsx';

export const TYPE_META = {
  idea: { label: 'Idea', glyph: '◆', tone: 'ink' },
  example: { label: 'Example', glyph: '❝', tone: 'sun' },
  mistake: { label: 'Mistake', glyph: '✕', tone: 'tomato' },
  beyond: { label: 'Beyond the essay', glyph: '＋', tone: 'sky' },
  visual: { label: 'Interactive', glyph: '▶', tone: 'leaf' },
  check: { label: 'Check', glyph: '?', tone: 'ink' },
  dogfood: { label: 'Dogfood', glyph: '🐶', tone: 'tomato' }
};

const VISUALS = { stack: StackVisual, engine: EngineVisual, tester: TesterVisual };

export default function SnackCard({ card, index, total }) {
  const meta = TYPE_META[card.type] ?? TYPE_META.idea;
  const Visual = card.type === 'visual' ? VISUALS[card.visual] : null;
  return (
    <SpotlightCard
      className={`snack snack--${card.type}`}
      theme="light"
      spotlightColor="#f2c230"
      intensity={0.5}
      spotlightSize={320}
      borderGlow={0.7}
      style={{ '--spotlight-card-surface': 'var(--card)', '--spotlight-card-border': 'var(--line)', '--spotlight-card-shadow': 'var(--shadow)', padding: 0 }}
    >
      <article className="snack__inner" aria-labelledby={`card-${card.id}-t`}>
        <header className="snack__head">
          <span className={`tag tag--${meta.tone}`}>
            <span aria-hidden="true">{meta.glyph}</span> {meta.label}
          </span>
          <span className="snack__count" aria-hidden="true">{index + 1} / {total}</span>
        </header>
        <h2 id={`card-${card.id}-t`} className="snack__title">{card.title}</h2>
        {card.body && (
          <p className="snack__body">
            <Rich text={card.body} />
          </p>
        )}
        {Visual && <Visual />}
        {card.type === 'check' && <CheckCard card={card} />}
        {card.type === 'dogfood' && <DogfoodAction card={card} />}
        {card.type === 'beyond' && (
          <p className="snack__note">Not in Perry’s essay — our practical extension to help you apply it safely.</p>
        )}
      </article>
    </SpotlightCard>
  );
}
