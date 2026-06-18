import Link from 'next/link';
import { getContent } from '@/lib/content';
import Marquee from '@/components/Marquee';
import Reveal from '@/components/Reveal';
import EmailButton from '@/components/EmailButton';

export default async function Home() {
  const c = await getContent();
  const h = c.home;
  const pillars = [
    { key: 'content-creation', num: '01' },
    { key: 'modeling', num: '02' },
    { key: 'acting', num: '03' },
  ];
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-text">
              <div className="kicker"><span className="dot"></span> {h.kicker}</div>
              <h1 className="display">{h.h1line1}<span className="line2">{h.h1line2}</span></h1>
              <p className="hero-sub"><b>{h.sub_bold}</b> {h.sub_rest}</p>
              <div className="hero-actions">
                <EmailButton email={c.site.email} subject="Collab / Booking Inquiry" className="btn btn-primary" label={`${h.primaryCtaLabel} →`} />
                <a href={c.social.instagram} target="_blank" rel="noopener" className="btn btn-ghost">{h.ghostCtaLabel}</a>
              </div>
            </div>
            <div className="portrait-col">
              <div className="ruler" aria-hidden="true">
                <div className="tick"><i></i>6'9"</div>
                <div className="tick"><i></i>5'0"</div>
                <div className="tick"><i></i>3'0"</div>
                <div className="tick"><i></i>0</div>
              </div>
              <div className="portrait">
                <img src={h.portrait} alt="Ben Davis, 6 foot 9 creator, actor and model" />
                <div className="tag">{h.portraitTag}<small>{h.portraitTagSub}</small></div>
              </div>
            </div>
          </div>
        </div>
        <div className="stats" style={{ marginTop: 54 }}>
          <div className="wrap"><div className="stats-inner">
            {c.stats.map((s, i) => (
              <div className="stat" key={i}><div className="n">{s.n}</div><div className="l">{s.l}</div></div>
            ))}
          </div></div>
        </div>
      </section>

      <Marquee items={c.marquee} />

      <section className="block">
        <div className="wrap">
          <Reveal><div className="eyebrow">What I Do</div></Reveal>
          <Reveal as="h2" className="display block-h2"><span style={{ fontSize: 'clamp(38px,6vw,76px)' }}>Work with me</span></Reveal>
          <div className="work-grid">
            {pillars.map((p, i) => {
              const pg = c.pages[p.key];
              return (
                <Reveal key={p.key} delay={i + 1}>
                  <Link href={`/${p.key}`} className="card" style={{ display: 'block' }}>
                    <div className="num">{p.num}</div>
                    <h3>{pg.title}</h3>
                    <p>{pg.intro}</p>
                    <div style={{ marginTop: 16, fontWeight: 800, letterSpacing: '.06em', color: 'var(--blue-deep)', fontSize: 13, textTransform: 'uppercase' }}>Explore &rarr;</div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="book">
        <div className="wrap">
          <Reveal><div className="eyebrow">Always Open</div></Reveal>
          <Reveal as="h2" className="display"><span>Let's <span className="accent">collab</span></span></Reveal>
          <Reveal><p>Brand deals, bookings, shoots or something new. Slide into the DMs or send an email and let's make it.</p></Reveal>
          <Reveal><div className="hero-actions" style={{ justifyContent: 'center' }}>
            <EmailButton email={c.site.email} subject="Collab / Booking Inquiry" className="btn btn-primary" label={c.site.email} />
            <a href={c.social.instagram} target="_blank" rel="noopener" className="btn btn-ghost">DM on Instagram</a>
          </div></Reveal>
        </div>
      </section>
    </>
  );
}
