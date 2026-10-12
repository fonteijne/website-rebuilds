import { useRef, useState } from 'react';
import StackBoard from './StackBoard.jsx';

const CAPTIONS = {
  idle: 'The top task feels urgent and vital. Press play and watch what happens beneath it.',
  avoid: 'The top task is avoided — it is the engine.',
  cascade: 'Everything beneath gets done, as a way of not doing the top task.',
  swap: 'Something bigger arrives (the swap) — and the old top item finally becomes a way of avoiding it.'
};

export default function StackVisual() {
  const board = useRef(null);
  const [step, setStep] = useState('idle');
  const play = () => {
    const tl = board.current?.getTimeline();
    if (!tl) return;
    setStep('idle');
    tl.restart();
  };
  return (
    <div className="visual">
      <StackBoard ref={board} onStep={setStep} />
      <p className="visual__caption" aria-live="polite">{CAPTIONS[step]}</p>
      <button type="button" className="btn btn--sm" onClick={play}>▶ Play the stack</button>
    </div>
  );
}
