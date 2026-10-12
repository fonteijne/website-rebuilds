import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Totals follow the paper's Fig. 3 (~4.9k / ~5.5k / ~5.6k / ~42k). The per-layer split is illustrative.
const VIEWS: { id: string; label: string; seg: number[] }[] = [
  { id: 'research', label: '01 Research', seg: [1.4, 1.3, 2.2, 0] },
  { id: 'script', label: '02 Script', seg: [1.4, 1.8, 2.3, 0] },
  { id: 'prod', label: '03 Production', seg: [1.5, 1.9, 2.2, 0] },
  { id: 'mono', label: 'Monolithic', seg: [1.5, 1.9, 1.6, 37] },
];
const COLORS = ['var(--color-l1)', 'var(--color-l3)', 'var(--color-l4)', 'rgba(255,255,255,.14)'];
const NAMES = ['Layers 0–2 (structural)', 'Layer 3 (reference)', 'Layer 4 (working)', 'Unused / irrelevant'];
const MAX = 42;

export default function CtxWindow() {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const view = VIEWS[v];
  const total = view.seg.reduce((a, b) => a + b, 0);
  const relevant = total - view.seg[3];

  useGSAP(
    () => {
      gsap.fromTo('.seg', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.8, ease: 'power3.out', stagger: 0.08 });
      gsap.fromTo('.total', { innerText: 0 }, { innerText: total, duration: 0.8, snap: { innerText: 0.1 }, ease: 'power2.out' });
    },
    { scope: ref, dependencies: [v] },
  );

  return (
    <div ref={ref}>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {VIEWS.map((x, i) => (
          <button key={x.id} role="tab" aria-selected={v === i} onClick={() => setV(i)} className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${v === i ? 'border-l0 bg-l0/10 text-ink' : 'border-line text-mute hover:text-ink'}`}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="relative h-14 w-full overflow-hidden rounded-xl bg-white/[0.04]">
        <div className="absolute inset-y-0 left-0 flex" style={{ width: `${(total / MAX) * 100}%` }}>
          {view.seg.map((n, i) =>
            n > 0 ? (
              <div key={i} className="seg h-full" style={{ width: `${(n / total) * 100}%`, background: COLORS[i] }} title={`${NAMES[i]}: ~${n}k`} />
            ) : null,
          )}
        </div>
      </div>
      <div className="mono mt-1 flex justify-between text-[11px] text-mute">
        <span>0</span>
        <span>{MAX}k tokens</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ul className="space-y-1.5 text-sm">
          {NAMES.map((n, i) => (
            <li key={n} className="flex items-center gap-2">
              <span className="size-3 rounded-sm" style={{ background: COLORS[i] }} />
              <span className="text-mute">{n}</span>
              <span className="mono ml-auto">~{view.seg[i]}k</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-line p-4">
          <div className="mono text-3xl font-semibold">
            ~<span className="total">{total}</span>k
          </div>
          <p className="mt-1 text-sm text-mute">
            {view.id === 'mono'
              ? `Only ~${Math.round((relevant / total) * 100)}% of this window helps with the current step. The rest buries it (“lost in the middle”).`
              : 'Everything in the window serves this stage. No other stage’s instructions or old outputs are loaded.'}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-mute">Totals from the paper’s Fig. 3; the split between layers is illustrative.</p>
    </div>
  );
}
