import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRoute } from './lib/route';
import SmoothScroll, { scrollTop } from './components/SmoothScroll';
import Nav from './components/Nav';
import Landing from './components/Landing';
import ModuleView from './components/ModuleView';
import Builder from './components/Builder';
import Coverage from './components/Coverage';

export default function App() {
  const route = useRoute();
  const key = route.name === 'module' ? `m:${route.id}` : route.name;

  useEffect(() => {
    scrollTop();
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(t);
  }, [key]);

  return (
    <>
      <SmoothScroll />
      <a
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-l0 focus:px-3 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <Nav route={route} />
      <main id="main" tabIndex={-1} className="outline-none" key={key}>
        {route.name === 'home' && <Landing />}
        {route.name === 'module' && <ModuleView id={route.id} />}
        {route.name === 'build' && <Builder />}
        {route.name === 'map' && <Coverage />}
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-12 text-sm text-mute sm:px-6">
        <p>
          Based on <em>Interpretable Context Methodology: Folder Structure as Agent Architecture</em> by Jake Van Clief
          and David McDermott (
          <a className="underline hover:text-ink" href="https://arxiv.org/abs/2603.16021" target="_blank" rel="noreferrer">
            arXiv:2603.16021
          </a>
          ). An independent learning companion, not affiliated with the authors. Animations by GSAP, smooth scroll by
          Lenis, UI pieces from React Bits.
        </p>
      </footer>
    </>
  );
}
