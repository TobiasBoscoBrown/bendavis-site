import Reveal from './Reveal';
export default function Gallery({ items }) {
  return (
    <div className="gallery">
      {items.map((g, i) => (
        <Reveal key={i} className="floaty" delay={(i % 3) + 1}>
          <img src={g.src} alt={g.alt} loading="lazy" />
          {g.caption ? <span className="cap">{g.caption}</span> : null}
        </Reveal>
      ))}
    </div>
  );
}
