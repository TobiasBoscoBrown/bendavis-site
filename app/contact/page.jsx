import { getContent } from '@/lib/content';
import Reveal from '@/components/Reveal';

export async function generateMetadata() {
  const c = await getContent();
  return { title: 'Contact — Ben Davis', description: c.pages.contact.intro, alternates: { canonical: `https://${c.site.domain}/contact` } };
}

export default async function Contact() {
  const c = await getContent();
  const p = c.pages.contact;
  const s = c.social;
  const links = [
    { label: 'Instagram', href: s.instagram }, { label: 'TikTok', href: s.tiktok },
    { label: 'YouTube', href: s.youtube }, { label: 'Snapchat', href: s.snapchat },
    { label: 'ShopMy', href: s.shopmy }, { label: 'Email', href: `mailto:${c.site.email}` },
  ];
  const support = [
    { label: 'Cash App', href: s.cashapp }, { label: 'Venmo', href: s.venmo },
    { label: 'PayPal', href: s.paypal }, { label: 'Wishlist', href: s.wishlist },
  ];
  return (
    <>
      <section className="block page-head">
        <div className="wrap">
          <Reveal><div className="eyebrow">{p.eyebrow}</div></Reveal>
          <Reveal as="h1" className="display"><span>{p.title}</span></Reveal>
          <Reveal><p className="lead">{p.intro}</p></Reveal>
          <Reveal><div className="hero-actions" style={{ marginTop: 30 }}>
            <a href={`mailto:${c.site.email}?subject=Collab%20%2F%20Booking%20Inquiry`} className="btn btn-primary">{c.site.email}</a>
            <a href={s.instagram} target="_blank" rel="noopener" className="btn btn-ghost">DM on Instagram</a>
          </div></Reveal>
        </div>
      </section>

      <section className="block connect" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <Reveal><div className="eyebrow">{p.connectEyebrow}</div></Reveal>
          <Reveal as="h2" className="display"><span style={{ fontSize: 'clamp(38px,6vw,76px)' }}>Connect</span></Reveal>
          <div className="links-grid">
            {links.map((l, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <a className="lnk" href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener" style={{ width: '100%' }}>
                  {l.label} <span className="arr">&rarr;</span>
                </a>
              </Reveal>
            ))}
          </div>
          <div className="support">
            <span className="slab">Support / Tips</span>
            {support.map((l, i) => (
              <a key={i} href={l.href} target="_blank" rel="noopener">{l.label}</a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
