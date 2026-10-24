import type { JSX } from 'react';
import type { DemoId } from '../../content/types';
import Ladder from './Ladder';
import Bypass from './Bypass';
import Modes from './Modes';
import HookSim from './HookSim';
import Sandbox from './Sandbox';
import Envs from './Envs';
import Trust from './Trust';
import Xcode from './Xcode';
import IosEnv from './IosEnv';
import XcodeSandbox from './XcodeSandbox';
import IosRules from './IosRules';

const map: Record<DemoId, () => JSX.Element> = {
  ladder: Ladder,
  bypass: Bypass,
  modes: Modes,
  hooksim: HookSim,
  sandbox: Sandbox,
  envs: Envs,
  trust: Trust,
  xcode: Xcode,
  iosenv: IosEnv,
  xcodesandbox: XcodeSandbox,
  iosrules: IosRules,
};

export default function Demo({ id }: { id: DemoId }) {
  const C = map[id];
  return (
    <div className="rounded-2xl border border-line bg-bg/60 p-3 sm:p-5">
      <C />
    </div>
  );
}
