import { getContent } from '@/lib/content';
import Reveal from '@/components/Reveal';
import Short from '@/components/Short';

export async function generateMetadata() {
  const c = await getContent();
  const p = c.pages.about;
  return { title: `${p.title} — Ben Davis`, description: p.paragraphs[0], alternates: { canonical: `https://${c.site.domain}/about` } };
}

export default async function About() {
  const c = await getContent();
  const p = c.pages.about;
  const big = (p.big || '').split('|');
  return (
    <>
      <section className="block page-head">
        <div className="wrap">
          <Reveal><div className="eyebrow">{p.eyebrow}</div></Reveal>
          <Reveal as="h1" className="display"><span>{p.title}</span></Reveal>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 12 }}>
        <div className="wrap about-grid">
          <Reveal>
            <div className="about-big display">
              {big.map((line, i) => i === 1 ? <span className="accent" key={i}>{line}</span> : <span key={i}>{line} </span>)}
            </div>
          </Reveal>
          <Reveal delay={1} className="about-copy">
            {p.paragraphs.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
            ))}
            <div className="about-list">
              {p.pills.map((pill, i) => (
                <span className={`pill${i === 0 ? ' fill' : ''}`} key={i}>{pill}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {p.videoId ? (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="video-row">
              <Reveal className="video-copy">
                <div className="eyebrow">Say Hi</div>
                <h3>{p.videoCaption}</h3>
                <p>A quick hello, straight from me.</p>
              </Reveal>
              <Reveal delay={2}><Short id={p.videoId} title="About Ben Davis" /></Reveal>
            </div>
          </div>
        </section>
      ) : null}

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="feature">
              <div className="fcopy">
                <div className="eyebrow">{p.guide.eyebrow}</div>
                <h2 className="display">{p.guide.title}</h2>
                <p>{p.guide.body}</p>
                <a href={p.guide.ctaHref} target="_blank" rel="noopener" className="btn btn-primary">{p.guide.ctaLabel} &rarr;</a>
              </div>
              <div className="fimg"><img src={p.guide.image} alt={p.guide.title} /></div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="partner">
              <div className="code">{p.partner.code}</div>
              <div className="pt"><b>{p.partner.text_pre}</b> {p.partner.text_rest}</div>
              <a href={p.partner.ctaHref} target="_blank" rel="noopener" className="btn btn-ghost">{p.partner.ctaLabel} &rarr;</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
