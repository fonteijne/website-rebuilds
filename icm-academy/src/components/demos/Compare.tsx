import { useState } from 'react';

const EASIER = [
  ['Change stage order', 'Edit orchestration code, redeploy', 'Rename or reorder folders'],
  ['Modify a prompt', 'Edit agent configuration in code', 'Edit a markdown file'],
  ['Add or remove a stage', 'Write new agent class, update orchestrator', 'Add or delete a folder'],
  ['Inspect intermediate state', 'Add logging, build dashboard', 'Open the folder, read the files'],
  ['Hand off to another person', 'Document environment, dependencies, setup', 'Copy the folder'],
  ['Who can make changes', 'Developer', 'Anyone with a text editor'],
];
const HARDER = [
  ['Error recovery mid-pipeline', 'Built-in retry, fallback, exception handling', 'Manual re-run of failed stage'],
  ['Conditional branching', 'Programmatic routing on agent output', 'Human decides between stages'],
  ['Concurrent execution', 'Native parallel agent coordination', 'Sequential by design'],
  ['External service integration', 'Programmatic API calls, auth management', 'Local scripts or MCP connections'],
];

export default function Compare() {
  const [easy, setEasy] = useState(true);
  const rows = easy ? EASIER : HARDER;
  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-line p-1 text-sm" role="tablist">
        {[
          [true, 'Easier with ICM'],
          [false, 'Easier with frameworks'],
        ].map(([v, l]) => (
          <button
            key={String(v)}
            role="tab"
            aria-selected={easy === v}
            onClick={() => setEasy(v as boolean)}
            className={`rounded-full px-4 py-1.5 transition-colors ${easy === v ? 'bg-white/10 text-ink' : 'text-mute'}`}
          >
            {l as string}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-mute">
              <th className="py-2 pr-3 font-semibold">Dimension</th>
              <th className="py-2 pr-3 font-semibold">Framework</th>
              <th className="py-2 font-semibold text-l0">ICM</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([d, f, i]) => (
              <tr key={d} className="border-t border-line align-top">
                <td className="py-2.5 pr-3 font-medium">{d}</td>
                <td className="py-2.5 pr-3 text-mute">{f}</td>
                <td className="py-2.5">{i}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
