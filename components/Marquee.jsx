// Seamless infinite marquee: two identical halves, animate to -50%.
export default function Marquee({ items }) {
  const half = (
    <span className="marquee-half" aria-hidden="true">
      {items.map((w, i) => (
        <span className="unit" key={i}>{w}<i>/</i></span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-label={items.join(', ')}>
      <div className="marquee-track">{half}{half}</div>
    </div>
  );
}
