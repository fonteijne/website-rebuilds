import type { DemoId } from '../../content/types';
import Compare from './Compare';
import CtxWindow from './CtxWindow';
import Layers from './Layers';
import Classify from './Classify';
import Tree from './Tree';
import Contract from './Contract';
import Pipeline from './Pipeline';
import UShape from './UShape';
import Decision from './Decision';

const map: Record<DemoId, () => React.JSX.Element> = {
  compare: Compare,
  ctxwindow: CtxWindow,
  layers: Layers,
  classify: Classify,
  tree: Tree,
  contract: Contract,
  pipeline: Pipeline,
  ushape: UShape,
  decision: Decision,
};

export default function Demo({ id }: { id: DemoId }) {
  const C = map[id];
  return (
    <div className="rounded-2xl border border-line bg-bg/60 p-4 sm:p-5">
      <C />
    </div>
  );
}
