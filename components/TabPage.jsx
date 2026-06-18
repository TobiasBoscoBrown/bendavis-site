import { getContent } from '@/lib/content';
import Reveal from './Reveal';
import Short from './Short';
import EmailButton from './EmailButton';
import ZoomImg from './ZoomImg';
import Edit from './Edit';
import Blocks from './Blocks';

export default async function TabPage({ pageKey }) {
  const c = await getContent();
  const p = c.pages[pageKey];
  const base = `pages.${pageKey}`;
  return (
    <>
      <section className="block tab-hero">
        <div className="wrap tab-hero-grid">
          <div className="tab-hero-copy">
            <div className="eyebrow"><Edit path={`${base}.eyebrow`}>{p.eyebrow}</Edit></div>
            <h1 className="display"><Edit path={`${base}.title`}>{p.title}</Edit></h1>
            <p className="lead"><Edit path={`${base}.intro`}>{p.intro}</Edit></p>
            <div className="hero-actions">
              <EmailButton email={c.site.email} subject={`${p.title} inquiry`} className="btn btn-primary" label={p.ctaLabel || 'Book me'} />
              <a href={c.social.instagram} target="_blank" rel="noopener" className="btn btn-ghost">Instagram</a>
            </div>
          </div>
          {p.videoId ? (
            <div className="tab-hero-video">
              <Short id={p.videoId} title={`${p.title} — Ben Davis`} />
              <span className="vcap"><b>▶</b> <Edit path={`${base}.videoCaption`}>{p.videoCaption}</Edit></span>
              <span className="block-url">Video link or ID: <Edit path={`${base}.videoId`}>{p.videoId}</Edit></span>
            </div>
          ) : null}
        </div>
      </section>

      {p.gallery && p.gallery.length ? (
        <section className="block" style={{ paddingTop: 6 }}>
          <div className="wrap">
            <div className="eyebrow">Selects</div>
            <div className="tgal" data-edit-list={`${base}.gallery`}>
              {p.gallery.map((g, i) => (
                <Reveal key={i} className="tgal-item" delay={(i % 3) + 1} data-edit-index={i}>
                  <ZoomImg src={g.src} alt={g.alt} editPath={`${base}.gallery.${i}.src`} />
                  {g.caption ? <span className="cap"><Edit path={`${base}.gallery.${i}.caption`}>{g.caption}</Edit></span> : null}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="blocks-section"><div className="wrap"><Blocks path={`${base}.blocks`} blocks={p.blocks} /></div></section>

      <section className="tab-cta">
        <div className="wrap">
          <h2 className="display"><Edit path={`${base}.ctaLabel`}>{p.ctaLabel || "Let's collab"}</Edit></h2>
          <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 20 }}>
            <EmailButton email={c.site.email} subject={`${p.title} inquiry`} className="btn btn-primary" label="Email Ben" />
            <a href={c.social.instagram} target="_blank" rel="noopener" className="btn btn-ghost">DM on Instagram</a>
          </div>
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
