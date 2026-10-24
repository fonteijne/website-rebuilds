import { lazy, Suspense, useEffect, useState } from 'react';
import { FINE_POINTER, REDUCED } from '../../lib/gsap';

const DotGrid = lazy(() => import('./DotGrid'));

/**
 * WebGL DotGrid, code-split and only mounted on wide screens with a fine pointer and motion allowed.
 * Everywhere else a static CSS dot pattern stands in, so phones never download or run WebGL.
 */
export default function LazyDotGrid({ color }: { color: string }) {
  const [rich, setRich] = useState(false);
  useEffect(() => {
    const ok = () => window.matchMedia(`${FINE_POINTER} and (min-width: 900px)`).matches && !window.matchMedia(REDUCED).matches;
    if (!ok()) return;
    const idle = window.requestIdleCallback?.(() => setRich(true)) ?? window.setTimeout(() => setRich(true), 300);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : clearTimeout(idle));
  }, []);

  const fallback = (
    <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#26313a 1.4px, transparent 1.5px)', backgroundSize: '26px 26px' }} />
  );
  if (!rich) return fallback;
  return (
    <Suspense fallback={fallback}>
      <DotGrid dotSize={3} gap={26} baseColor="#26313a" activeColor={color} proximity={150} glow={0.5} style={{ width: '100%', height: '100%' }} />
    </Suspense>
  );
}
