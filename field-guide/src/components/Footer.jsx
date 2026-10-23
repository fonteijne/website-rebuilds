import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <p>
            <strong>The Procrastinator’s Field Guide</strong> is an unofficial study companion to John Perry’s essay{' '}
            <em>Structured Procrastination</em>. Explanations are paraphrased; the essay is © John Perry.
          </p>
          <p>
            <a href="https://www.structuredprocrastination.com/index.php" target="_blank" rel="noreferrer">
              Read the original essay ↗
            </a>
          </p>
        </div>
        <div>
          <h4>Study</h4>
          <ul>
            <li><Link to="/learn">All modules</Link></li>
            <li><Link to="/lab">The Lab</Link></li>
            <li><Link to="/quiz">Mastery check</Link></li>
            <li><Link to="/playbook">Playbook</Link></li>
          </ul>
        </div>
        <div>
          <h4>Built with</h4>
          <ul>
            <li><a href="https://github.com/greensock/GSAP" target="_blank" rel="noreferrer">GSAP</a> — animation</li>
            <li><a href="https://github.com/darkroomengineering/lenis" target="_blank" rel="noreferrer">Lenis</a> — smooth scroll</li>
            <li><a href="https://github.com/DavidHDev/react-bits" target="_blank" rel="noreferrer">React Bits</a> — UI effects</li>
            <li><a href="https://github.com/greensock/gsap-skills" target="_blank" rel="noreferrer">gsap-skills</a> — patterns</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
