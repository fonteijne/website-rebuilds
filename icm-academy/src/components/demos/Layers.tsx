import { useState } from 'react';
import { LAYERS } from '../../lib/layers';

export default function Layers() {
  const [n, setN] = useState(2);
  const L = LAYERS[n];
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <div className="space-y-2" role="tablist" aria-label="Context layers">
        {LAYERS.map((l) => (
          <button
            key={l.n}
            role="tab"
            aria-selected={n === l.n}
            onClick={() => setN(l.n)}
            className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
            style={{
              marginLeft: `${l.n * 10}px`,
              width: `calc(100% - ${l.n * 10}px)`,
              borderColor: n === l.n ? l.color : 'var(--color-line)',
              background: n === l.n ? `color-mix(in srgb, ${l.color} 12%, transparent)` : 'transparent',
            }}
          >
            <span className="mono font-semibold" style={{ color: l.color }}>
              L{l.n}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">“{l.question}”</span>
              <span className="mono text-[11px] text-mute">{l.tokens}</span>
            </span>
          </button>
        ))}
        <div className="mono ml-1 flex gap-4 pt-1 text-[11px] text-mute">
          <span>L0–2 structural</span>
          <span>L3–4 content</span>
        </div>
      </div>
      <div className="rounded-xl border p-4" style={{ borderColor: L.color }}>
        <div className="mono text-xs uppercase tracking-wider" style={{ color: L.color }}>
          Layer {L.n} · {L.name} · {L.kind}
        </div>
        <div className="mono mt-1 text-sm">{L.file}</div>
        <p className="mt-2 text-sm leading-relaxed text-ink/85">{L.body}</p>
        <pre className="mono mt-3 overflow-x-auto rounded-lg bg-bg p-3 text-[12px] leading-relaxed text-mute">{L.example}</pre>
      </div>
    </div>
  );
}
