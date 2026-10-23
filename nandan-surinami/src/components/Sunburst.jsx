// Radiating rays inspired by the sun in the H. Nandan logo.
export default function Sunburst({ rays = 28, className = '', inner = 120, outer = 500, width = 7 }) {
  const items = Array.from({ length: rays }, (_, i) => {
    const a = (i / rays) * Math.PI * 2;
    const half = (Math.PI / rays) * (width / 10);
    const p = (r, ang) => `${(500 + Math.cos(ang) * r).toFixed(1)},${(500 + Math.sin(ang) * r).toFixed(1)}`;
    return `${p(inner, a - half / 3)} ${p(outer, a - half)} ${p(outer, a + half)} ${p(inner, a + half / 3)}`;
  });
  return (
    <svg className={`sunburst ${className}`} viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      {items.map((pts, i) => (
        <polygon key={i} className="sunburst__ray" points={pts} />
      ))}
    </svg>
  );
}
