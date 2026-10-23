import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap.js';
import { ALL_CARDS, MODULES } from '../data/modules.js';
import { CONCEPTS } from '../data/concepts.js';
import { QUIZ } from '../data/quiz.js';
import { useStore } from '../lib/store.jsx';
import BlurText from '../components/BlurText.jsx';
import CountUp from '../components/CountUp.jsx';
import StackBoard from '../components/StackBoard.jsx';
import EngineVisual from '../components/EngineVisual.jsx';
import ShinyText from '../vendor/react-bits/ShinyText.jsx';
import '../vendor/react-bits/ShinyText.css';
import Magnet from '../vendor/react-bits/Magnet.jsx';
import SpotlightCard from '../vendor/react-bits/SpotlightCard.jsx';
import '../vendor/react-bits/SpotlightCard.css';
import { useReveal } from '../lib/useReveal.js';

const STORY = [
  { key: 'idle', n: '01', h: 'A list with a big scary item on top', p: 'It feels urgent. It feels vital. (We’ll learn why it isn’t.)' },
  { key: 'avoid', n: '02', h: 'You avoid it. Of course you do.', p: 'Avoidance isn’t the bug. It’s the engine Perry harnesses.' },
  { key: 'cascade', n: '03', h: 'So everything beneath it gets done', p: 'Each worthwhile task becomes a way of not doing the one above.' },
  { key: 'swap', n: '04', h: 'Then something bigger shows up', p: 'The old top item becomes the escape route. The cycle refuels itself.' }
];

function stepAt(tl, t) {
  const L = tl.labels;
  if (t >= L.swap) return 'swap';
  if (t >= L.cascade) return 'cascade';
  if (t >= L.avoid) return 'avoid';
  return 'idle';
}

export default function Home() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [dragon, setDragon] = useState('');
  const hero = useRef(null);
  const story = useRef(null);
  const board = useRef(null);
  const [step, setStep] = useState('idle');
  const revealRoot = useReveal();
  const avoiding = state.tasks.find((t) => t.avoided);

  // hero: floating sticky notes + pointer parallax (quickTo, per gsap-performance skill)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const notes = gsap.utils.toArray('.hero-note');
        notes.forEach((n, i) => {
          gsap.to(n, { y: i % 2 ? 10 : -10, rotate: `+=${i % 2 ? -1.5 : 1.5}`, duration: 2.6 + i * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        });
        gsap.from(notes, { autoAlpha: 0, y: 60, rotate: 0, stagger: 0.12, duration: 0.9, ease: 'back.out(1.4)', delay: 0.5 });
        const qx = notes.map((n, i) => gsap.quickTo(n, 'x', { duration: 0.8 + i * 0.1, ease: 'power3' }));
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          qx.forEach((q, i) => q(nx * (i % 2 ? -26 : 26)));
        };
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
      });
    },
    { scope: hero }
  );

  // scrollytelling: pin the section and scrub the stack timeline (or play it, on short screens)
  useGSAP(
    () => {
      const tl = board.current?.getTimeline();
      if (!tl) return undefined;
      const mm = gsap.matchMedia();
      let last = 'idle';
      mm.add('(prefers-reduced-motion: no-preference) and (min-height: 620px)', () => {
        const st = ScrollTrigger.create({
          trigger: story.current,
          start: 'top top+=64',
          end: '+=2600',
          pin: true,
          scrub: 0.6,
          animation: tl,
          anticipatePin: 1,
          onUpdate: () => {
            const s = stepAt(tl, tl.time());
            if (s !== last) {
              last = s;
              setStep(s);
            }
          }
        });
        return () => st.kill();
      });
      mm.add('(prefers-reduced-motion: no-preference) and (max-height: 619px)', () => {
        const st = ScrollTrigger.create({
          trigger: story.current,
          start: 'top 70%',
          once: true,
          onEnter: () => tl.eventCallback('onUpdate', () => {
            const s = stepAt(tl, tl.time());
            if (s !== last) {
              last = s;
              setStep(s);
            }
          }).play()
        });
        return () => st.kill();
      });
      mm.add('(prefers-reduced-motion: reduce)', () => setStep('swap'));
      return () => mm.revert();
    },
    { scope: story }
  );

  const begin = (e) => {
    e.preventDefault();
    const t = dragon.trim();
    if (t && !avoiding) {
      dispatch({ type: 'addTask', task: { title: t, role: 'fuel', importance: 5, seemsDue: true, consequence: 'unset', avoided: true } });
    }
    navigate('/learn/confession');
  };

  return (
    <>
      <section className="hero" ref={hero}>
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">A study companion to John Perry’s essay</p>
            <h1 className="hero__title">
              <BlurText text="Learn to procrastinate" />
              <br />
              <ShinyText text="on purpose." color="var(--tomato)" shineColor="#ffe9a3" speed={3} delay={1.4} shineWidth={50} />
            </h1>
            <p className="lead">
              Structured Procrastination turns the habit you’re ashamed of into a productivity engine. In{' '}
              <strong>{MODULES.length} modules of bite-sized cards</strong>, you’ll understand every idea in the essay and use it on
              your own to-do list as you go.
            </p>

            <form className="dragon" onSubmit={begin}>
              <label htmlFor="dragon">
                {avoiding ? (
                  <>You’re avoiding: <strong>{avoiding.title}</strong>. Good. Keep it that way — studying is now how you do it.</>
                ) : (
                  <>What important thing are you avoiding right now?</>
                )}
              </label>
              {!avoiding && (
                <input id="dragon" type="text" maxLength={80} placeholder="e.g. Write the quarterly report" value={dragon} onChange={(e) => setDragon(e.target.value)} />
              )}
              <div className="dragon__cta">
                <Magnet padding={80} magnetStrength={3}>
                  <button type="submit" className="btn btn--tomato">
                    {state.seen['m1-c1'] ? 'Continue learning' : 'Start learning — it counts as avoiding'} →
                  </button>
                </Magnet>
                <Link className="btn btn--ghost" to="/learn">See the course</Link>
              </div>
            </form>
          </div>

          <div className="hero__notes" aria-hidden="true">
            <div className="hero-note hero-note--a"><b>Q3 report</b><small>URGENT!!</small></div>
            <div className="hero-note hero-note--b"><b>Sharpen pencils</b><small>…still not done</small></div>
            <div className="hero-note hero-note--c"><b>Reorganise files ✓</b><small>done (suspiciously)</small></div>
            <div className="hero-note hero-note--d"><b>Ping-pong with students ✓</b><small>“terrific Fellow”</small></div>
          </div>
        </div>
      </section>

      <section className="story" ref={story} aria-labelledby="story-h">
        <div className="wrap story__grid">
          <div className="story__copy">
            <p className="eyebrow">The idea in 30 seconds</p>
            <h2 id="story-h">Scroll to watch it run.</h2>
            <ol className="steps" aria-label="The method, in four steps">
              {STORY.map((s) => (
                <li key={s.key} className={`step${step === s.key ? ' step--on' : ''}`} aria-current={step === s.key ? 'step' : undefined}>
                  <span className="step__n">{s.n}</span>
                  <div>
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="story__board">
            <StackBoard ref={board} />
          </div>
        </div>
      </section>

      <div ref={revealRoot}>
        <section className="section wrap" aria-labelledby="engine-h">
          <div className="split">
            <div data-reveal>
              <p className="eyebrow">Why more tasks beats fewer</p>
              <h2 id="engine-h">The classic mistake: <span className="hl">shrinking your list.</span></h2>
              <p className="lead">
                Procrastinators instinctively cut commitments, hoping a short list gets finished. Perry says that destroys your best
                motivation. Drag the slider and see why avoidance needs somewhere useful to go.
              </p>
            </div>
            <div data-reveal><EngineVisual /></div>
          </div>
        </section>

        <section className="band" aria-label="The course at a glance">
          <div className="wrap band__grid">
            <div data-reveal><CountUp to={CONCEPTS.length} className="band__num" /><span>ideas distilled from the essay</span></div>
            <div data-reveal><CountUp to={ALL_CARDS.length} className="band__num" /><span>snack-sized cards</span></div>
            <div data-reveal><CountUp to={QUIZ.length} className="band__num" /><span>mastery questions</span></div>
            <div data-reveal><CountUp to={95} suffix="%" className="band__num" /><span>coverage = ready to practise</span></div>
          </div>
        </section>

        <section className="section wrap" aria-labelledby="dog-h">
          <p className="eyebrow" data-reveal>The dogfood method</p>
          <h2 id="dog-h" data-reveal>You don’t just <span className="hl">read</span> it. You eat it.</h2>
          <p className="lead" data-reveal>
            “Eating your own dog food” means using your own product. Every module ends by making you apply the idea to a real task of
            yours — so by the end, you’ve already built and run your own stack.
          </p>
          <div className="loop">
            {[
              ['1', 'Snack', 'One idea per card. Under a minute. Paraphrased from the essay, with the source a click away.'],
              ['2', 'Check', 'One question straight after. Retrieval beats re-reading, and every correct answer lights up a concept.'],
              ['3', 'Dogfood', 'Apply it to your real list: name your dragon, find your fuel, audit a deadline.'],
              ['4', 'Prove', 'Take the mastery check. Hit 95% concept coverage and you’re ready to practise.']
            ].map(([n, h, p]) => (
              <div key={n} data-reveal>
                <SpotlightCard
                  className="loop__card"
                  theme="light"
                  spotlightColor="#f2c230"
                  intensity={0.45}
                  style={{ '--spotlight-card-surface': 'var(--card)', '--spotlight-card-border': 'var(--line)', '--spotlight-card-shadow': 'var(--shadow)', padding: 0 }}
                >
                  <div className="loop__inner">
                    <span className="loop__n">{n}</span>
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>
        </section>

        <section className="section wrap" aria-labelledby="outcomes-h">
          <div className="split split--top">
            <div data-reveal>
              <p className="eyebrow">After this guide you can…</p>
              <h2 id="outcomes-h">Explain it. Build it. <span className="hl">Spot a fire.</span></h2>
            </div>
            <ul className="outcomes" data-reveal>
              <li><b>Explain</b> the method, its mechanism and its two selection criteria in 30 seconds.</li>
              <li><b>Build</b> your own ordered stack with real fuel on top and 10+ worthwhile fillers beneath.</li>
              <li><b>Tell fuel from fire</b> — which tasks are safe to hide at the top and which have real consequences.</li>
              <li><b>Run</b> a 2-minute daily ritual and a 10-minute weekly review.</li>
            </ul>
          </div>
        </section>

        <section className="section wrap cta" aria-labelledby="cta-h">
          <div data-reveal className="cta__box">
            <h2 id="cta-h">Ready to not do something important?</h2>
            <p className="lead">Start with Module 1. It takes four minutes, and it is a perfectly good reason to put off your real work.</p>
            <Link to="/learn/confession" className="btn btn--tomato">Begin Module 1 →</Link>{' '}
            <a className="btn btn--ghost" href="https://www.structuredprocrastination.com/index.php" target="_blank" rel="noreferrer">
              Read the original essay ↗
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
