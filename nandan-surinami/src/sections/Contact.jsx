import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { socials, linktree } from '../data/content';
import RevealTitle from '../components/RevealTitle';

// Set VITE_CONTACT_ENDPOINT (e.g. a Formspree / Basin / own API URL) to receive
// submissions as JSON. Without it the form explains how to reach the team instead.
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT;

const icons = {
  Instagram: <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01" />,
  Facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />,
  TikTok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.4 4.5 5 5" />,
};

export default function Contact({ subject, setSubject }) {
  const root = useRef(null);
  const [status, setStatus] = useState('idle');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.social', {
          yPercent: 100,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: '.socials', start: 'top 88%', once: true },
        });
        gsap.from('.field', {
          y: 40,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.9,
          scrollTrigger: { trigger: '.form', start: 'top 85%', once: true },
        });
      });
    },
    { scope: root }
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!ENDPOINT) {
      setStatus('offline');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(res.statusText);
      form.reset();
      setSubject('');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="contact" id="contact" ref={root} aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__left">
          <p className="kicker">Volg ons op social media</p>
          <ul className="socials">
            {socials.map((s) => (
              <li key={s.name} className="social-wrap">
                <a className="social" href={s.href} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true">{icons[s.name]}</svg>
                  <span className="social__label" data-text={s.name}>{s.name}</span>
                  <svg className="social__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
                </a>
              </li>
            ))}
          </ul>
          <a className="link-underline" href={linktree} target="_blank" rel="noopener noreferrer">Alle links op Linktree</a>
        </div>

        <div className="contact__right">
          <RevealTitle className="display display--md" id="contact-title">
            Neem gerust <em>contact</em> met ons op
          </RevealTitle>
          <p className="lead">
            Heeft u een vraag of wilt u met ons in contact komen? Wij helpen u graag verder. Vul ons
            contactformulier in en wij nemen zo snel mogelijk contact met u op.
          </p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <label className="field">
              <span>Uw naam</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label className="field">
              <span>Uw e-mailadres</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="field field--full">
              <span>Onderwerp</span>
              <input name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="field field--full">
              <span>Uw bericht</span>
              <textarea name="message" rows="5" required />
            </label>
            <div className="field field--full form__foot">
              <button className="btn btn--red btn--lg" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Versturen…' : 'Verstuur bericht'}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <p className={`form__status form__status--${status}`} role="status">
                {status === 'sent' && 'Bedankt! We nemen zo snel mogelijk contact met u op.'}
                {status === 'error' && 'Er ging iets mis bij het versturen. Probeer het later opnieuw of stuur ons een bericht via social media.'}
                {status === 'offline' && 'Het formulier is nog niet gekoppeld. Stuur ons in de tussentijd een bericht via Instagram of Facebook.'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
