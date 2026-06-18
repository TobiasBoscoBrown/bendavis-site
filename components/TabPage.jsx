import { getContent } from '@/lib/content';
import Reveal from './Reveal';
import Gallery from './Gallery';
import Short from './Short';

export default async function TabPage({ pageKey }) {
  const c = await getContent();
  const p = c.pages[pageKey];
  return (
    <>
      <section className="block page-head">
        <div className="wrap">
          <Reveal><div className="eyebrow">{p.eyebrow}</div></Reveal>
          <Reveal as="h1" className="display"><span>{p.title}</span></Reveal>
          <Reveal><p className="lead">{p.intro}</p></Reveal>
        </div>
      </section>

      {p.videoId ? (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="video-row">
              <Reveal className="video-copy">
                <div className="eyebrow">Watch</div>
                <h3>{p.videoCaption}</h3>
                <p>Hit play. This is the energy you're booking.</p>
              </Reveal>
              <Reveal delay={2}><Short id={p.videoId} title={`${p.title} — Ben Davis`} /></Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {p.gallery && p.gallery.length ? (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal><div className="eyebrow">Selects</div></Reveal>
            <Gallery items={p.gallery} />
          </div>
        </section>
      ) : null}

      <section className="book" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <Reveal as="h2" className="display"><span>{p.ctaLabel || "Let's collab"}</span></Reveal>
          <Reveal><div className="hero-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            <a href={`mailto:${c.site.email}?subject=${encodeURIComponent(p.title + ' inquiry')}`} className="btn btn-primary">Email Ben</a>
            <a href={c.social.instagram} target="_blank" rel="noopener" className="btn btn-ghost">DM on Instagram</a>
          </div></Reveal>
        </div>
      </section>
    </>
  );
}

export async function tabMetadata(pageKey) {
  const c = await getContent();
  const p = c.pages[pageKey];
  return {
    title: `${p.title} — Ben Davis`,
    description: p.intro,
    alternates: { canonical: `https://${c.site.domain}/${pageKey}` },
  };
}
