import { getContent } from '@/lib/content';
import Reveal from '@/components/Reveal';
import Short from '@/components/Short';
import ZoomImg from '@/components/ZoomImg';
import Edit from '@/components/Edit';
import Blocks from '@/components/Blocks';
import PromoStrip from '@/components/PromoStrip';

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
        <div className="wrap about-head">
          <div>
            <div className="eyebrow"><Edit path="pages.about.eyebrow">{p.eyebrow}</Edit></div>
            <h1 className="display"><Edit path="pages.about.title">{p.title}</Edit></h1>
          </div>
          {p.heroImage ? (
            <div className="about-hero-img"><ZoomImg src={p.heroImage} editPath="pages.about.heroImage" alt="Ben Davis, 6 foot 9 creator, actor and model" /></div>
          ) : null}
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
              <p key={i} data-edit={`pages.about.paragraphs.${i}`} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
            ))}
            <div className="about-list" data-edit-list="pages.about.pills">
              {p.pills.map((pill, i) => (
                <span className={`pill${i === 0 ? ' fill' : ''}`} data-edit-index={i} key={i}><Edit path={`pages.about.pills.${i}`}>{pill}</Edit></span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {p.videoId ? (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal>
              <div className="video-panel">
                <div className="vp-copy">
                  <div className="eyebrow">Say Hi</div>
                  <h3><Edit path="pages.about.videoCaption">{p.videoCaption}</Edit></h3>
                  <p>A quick hello, straight from me. Hit play and meet the 6'9" energy you'd be working with.</p>
                  <a href={c.social.instagram} target="_blank" rel="noopener" className="btn btn-ghost" style={{ marginTop: 8 }}>Follow on Instagram</a>
                  <span className="block-url" style={{ marginTop: 10 }}>Video link or ID: <Edit path="pages.about.videoId">{p.videoId}</Edit></span>
                </div>
                <Short id={p.videoId} title="About Ben Davis" />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="feature">
              <div className="fcopy">
                <div className="eyebrow"><Edit path="pages.about.guide.eyebrow">{p.guide.eyebrow}</Edit></div>
                <h2 className="display"><Edit path="pages.about.guide.title">{p.guide.title}</Edit></h2>
                <p><Edit path="pages.about.guide.body">{p.guide.body}</Edit></p>
                <a href={p.guide.ctaHref} target="_blank" rel="noopener" className="btn btn-primary"><Edit path="pages.about.guide.ctaLabel">{p.guide.ctaLabel}</Edit> →</a>
              </div>
              <div className="fimg"><ZoomImg src={p.guide.image} editPath="pages.about.guide.image" alt={p.guide.title} /></div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="partner">
              <div className="code"><Edit path="pages.about.partner.code">{p.partner.code}</Edit></div>
              <div className="pt"><b><Edit path="pages.about.partner.text_pre">{p.partner.text_pre}</Edit></b> <Edit path="pages.about.partner.text_rest">{p.partner.text_rest}</Edit></div>
              <a href={p.partner.ctaHref} target="_blank" rel="noopener" className="btn btn-ghost"><Edit path="pages.about.partner.ctaLabel">{p.partner.ctaLabel}</Edit> →</a>
            </div>
          </Reveal>
        </div>
      </section>

      <PromoStrip promos={c.promoLinks} />

      <section className="blocks-section"><div className="wrap"><Blocks path="pages.about.blocks" blocks={p.blocks} /></div></section>
    </>
  );
}
