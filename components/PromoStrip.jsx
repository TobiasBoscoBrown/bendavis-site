export default function PromoStrip({ promos }) {
  if (!promos || !promos.length) return null;
  return (
    <section className="block" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="eyebrow">Promos &amp; Discounts</div>
        <div className="promo-strip">
          {promos.map((pl, i) => (
            <a key={i} className="btn btn-ghost" href={pl.href} target="_blank" rel="noopener">{pl.label}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
