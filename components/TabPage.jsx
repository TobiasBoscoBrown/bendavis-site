import { getContent } from '@/lib/content';
import Reveal from './Reveal';
import Feed from './Feed';

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

      <section className="block" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <Reveal><div className="eyebrow">Watch &amp; Selects</div></Reveal>
          <Feed videoId={p.videoId} videoTitle={`${p.title} — Ben Davis`} items={p.gallery} watchLabel={p.videoCaption} />
        </div>
      </section>

      <section className="book" style={{ paddingTop: 36 }}>
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
  return { title: `${p.title} — Ben Davis`, description: p.intro, alternates: { canonical: `https://${c.site.domain}/${pageKey}` } };
}
