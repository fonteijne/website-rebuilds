import { useState } from 'react';

const STAGES = ['01 Research', '02 Script', '03 Production'];

const research0 = `Angle: Why folders can replace agent frameworks
Point: Stages are numbered folders
Point: Each stage reads only what it needs
Point: Humans can edit every output`;

function script(research: string) {
  const l = research.split('\n').filter(Boolean);
  return ['HOOK  ' + (l[0] ?? ''), ...l.slice(1).map((x, i) => `SCENE ${i + 1}  ${x.replace(/^Point:\s*/i, '')}`), 'CLOSE  Configure the factory once, run it forever.'].join('\n');
}
function production(sc: string) {
  return sc
    .split('\n')
    .filter(Boolean)
    .map((x, i) => `frame ${String(i * 90).padStart(3, '0')}–${i * 90 + 89}: animate → ${x.slice(0, 48)}`)
    .join('\n');
}

export default function Pipeline() {
  const [out, setOut] = useState(['', '', '']);
  const [ver, setVer] = useState([0, 0, 0]); // version of each output
  const [seen, setSeen] = useState<(number | null)[]>([null, null, null]); // version of upstream each stage consumed
  const [log, setLog] = useState('Press “Run stage 01”. The agent reads the stage contract and writes to output/.');

  const gen = [() => research0, () => script(out[0]), () => production(out[1])];
  const run = (n: number) => {
    const o = [...out];
    o[n] = gen[n]();
    setOut(o);
    const v = [...ver];
    v[n]++;
    setVer(v);
    const s = [...seen];
    s[n] = n === 0 ? 0 : ver[n - 1];
    setSeen(s);
    setLog(n === 0 ? 'Stage 01 read: brief + references/. Wrote 01_research/output/.' : `Stage 0${n + 1} read: CONTEXT.md + 0${n}_…/output/ exactly as it is on disk (including your edits). Wrote its own output/.`);
  };
  const edit = (n: number, t: string) => {
    const o = [...out];
    o[n] = t;
    setOut(o);
    const v = [...ver];
    v[n]++;
    setVer(v);
  };
  const ran = (n: number) => ver[n] > 0;
  // a stage is stale if its upstream changed since it ran, or if upstream is itself stale (cascades downstream)
  const stale = (n: number): boolean => n > 0 && ran(n) && (seen[n] !== ver[n - 1] || stale(n - 1));
  const canRun = (n: number) => n === 0 || ran(n - 1);

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-3">
        {STAGES.map((name, n) => (
          <div key={name} className="flex flex-col rounded-xl border border-line p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="mono text-xs font-semibold">{name}</span>
              {stale(n) && <span className="rounded-full bg-l0/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-l0">stale: re-run</span>}
              {ran(n) && !stale(n) && <span className="rounded-full bg-l4/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-l4">fresh</span>}
            </div>
            <textarea
              className="field min-h-36 flex-1"
              aria-label={`${name} output`}
              placeholder={canRun(n) ? 'output/ is empty' : 'waiting for the previous stage'}
              value={out[n]}
              onChange={(e) => edit(n, e.target.value)}
              disabled={!ran(n)}
            />
            <button className="btn mt-2 justify-center" onClick={() => run(n)} disabled={!canRun(n)}>
              {ran(n) ? `Re-run stage 0${n + 1}` : `Run stage 0${n + 1}`}
            </button>
            {n < 2 && <div className="mt-2 text-center text-[11px] text-mute">review gate ↓ edit freely</div>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-mute" role="status">
        <span className="mono text-l0">agent log ›</span> {log}
      </p>
      <p className="mt-1 text-xs text-mute">Try it: run all three, then edit a “Point:” line in stage 01. Stages 02 and 03 turn stale, and you re-run only what changed.</p>
    </div>
  );
}
