const Half = ({ words }) => (
  <span className="marquee-half" aria-hidden="true">
    {words.map((w, i) => (
      <span className="unit" key={i}>{w}<i>/</i></span>
    ))}
  </span>
);

// Seamless infinite marquee: two identical halves, each repeated enough times to
// exceed any viewport width, animated to -50% so the loop never shows a gap.
export default function Marquee({ items }) {
  const words = [];
  for (let r = 0; r < 4; r++) words.push(...items);
  return (
    <div className="marquee" aria-label={items.join(', ')}>
      <div className="marquee-track"><Half words={words} /><Half words={words} /></div>
    </div>
  );
}
