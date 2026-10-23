import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useStore } from '../../lib/store';

gsap.registerPlugin(useGSAP);

const BARS = [
  { l: 'Stage 1 · Research', v: 92, note: 'direction-setting: creative judgment' },
  { l: 'Stage 2 · Script', v: 30, note: 'constrained by anchors on both sides' },
  { l: 'Stage 3 · Production', v: 78, note: 'alignment work: closer to debugging' },
];

export default function UShape() {
  const ref = useRef<HTMLDivElement>(null);
  const { ws } = useStore();
  useGSAP(() => { gsap.from('.ubar', { scaleY: 0, transformOrigin: 'bottom', duration: 0.9, stagger: 0.12, ease: 'power3.out' }); }, { scope: ref });
  return (
    <div ref={ref}>
      <div className="flex h-48 items-end gap-4" role="img" aria-label="Bar chart of editing frequency: stage 1 92 percent, stage 2 30 percent, stage 3 78 percent">
        {BARS.map((b, i) => (
          <div key={b.l} className="flex h-full flex-1 flex-col justify-end">
            <div className="mono mb-1 text-center text-sm">{b.v}%</div>
            <div className="ubar rounded-t-lg" style={{ height: `${b.v}%`, background: i === 1 ? 'var(--color-l3)' : 'var(--color-l0)' }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4">
        {BARS.map((b) => (
          <div key={b.l} className="flex-1 text-center">
            <div className="text-xs font-medium">{b.l}</div>
            <div className="text-[11px] leading-snug text-mute">{b.note}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-mute">
        Approximate values from Fig. 5; self-reported by 33 practitioners (30 showed this U-shape, 3 reported equal editing). Not instrumented measurement.
        {ws.stages.length > 0 && ' Your own harness has ' + ws.stages.length + ' stages: where will you edit most?'}
      </p>
    </div>
  );
}
