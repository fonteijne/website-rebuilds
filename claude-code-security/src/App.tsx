import { lazy, Suspense, useEffect } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { useRoute } from './lib/route';
import SmoothScroll, { scrollTop } from './components/SmoothScroll';
import Nav from './components/Nav';
import Landing from './components/Landing';

// Everything except the landing page is split out, so the first load stays small.
const IosTrack = lazy(() => import('./components/IosTrack'));
const OfflineTrack = lazy(() => import('./components/OfflineTrack'));
const ModuleView = lazy(() => import('./components/ModuleView'));
const Builder = lazy(() => import('./components/Builder'));
const Coverage = lazy(() => import('./components/Coverage'));

export default function App() {
  const route = useRoute();
  const key = route.name === 'module' ? `m:${route.id}` : route.name;

  useEffect(() => {
    scrollTop();
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [key]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <SmoothScroll />
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-guard focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Nav route={route} />
      <main id="main" tabIndex={-1} className="outline-none" key={key}>
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          {route.name === 'home' && <Landing />}
          {route.name === 'ios' && <IosTrack />}
          {route.name === 'offline' && <OfflineTrack />}
          {route.name === 'module' && <ModuleView id={route.id} />}
          {route.name === 'build' && <Builder />}
          {route.name === 'map' && <Coverage />}
        </Suspense>
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-12 text-sm text-mute sm:px-6">
        <p>
          An independent learning site about Claude Code security, built on the{' '}
          <a className="underline hover:text-ink" href="https://code.claude.com/docs/en/security" target="_blank" rel="noreferrer">
            Claude Code docs
          </a>{' '}
          and Apple’s{' '}
          <a className="underline hover:text-ink" href="https://developer.apple.com/documentation/xcode/setting-up-coding-intelligence" target="_blank" rel="noreferrer">
            Xcode documentation
          </a>
          . Not affiliated with Anthropic or Apple. Settings change quickly: cards marked “verify” are worth checking on your own setup. Checked against the docs in October 2026.
        </p>
      </footer>
    </>
  );
}
