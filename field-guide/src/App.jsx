import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';
import Home from './pages/Home.jsx';

const Learn = lazy(() => import('./pages/Learn.jsx'));
const Module = lazy(() => import('./pages/Module.jsx'));
const Lab = lazy(() => import('./pages/Lab.jsx'));
const Quiz = lazy(() => import('./pages/Quiz.jsx'));
const Playbook = lazy(() => import('./pages/Playbook.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="wrap section" aria-busy="true">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:moduleId" element={<Module />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/playbook" element={<Playbook />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
