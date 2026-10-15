import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap section">
      <p className="eyebrow">404</p>
      <h1 className="page-title">This page is... still on the list.</h1>
      <p className="lead">It has a very clear deadline (it doesn’t). Meanwhile, here are things you can actually do.</p>
      <p><Link className="btn" to="/learn">Start learning →</Link></p>
    </div>
  );
}
