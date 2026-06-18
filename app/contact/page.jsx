import { getContent } from '@/lib/content';
import Reveal from '@/components/Reveal';
import EmailButton from '@/components/EmailButton';
import Edit from '@/components/Edit';
import Blocks from '@/components/Blocks';

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
          <div className="eyebrow"><Edit path="pages.contact.eyebrow">{p.eyebrow}</Edit></div>
          <h1 className="display"><Edit path="pages.contact.title">{p.title}</Edit></h1>
          <p className="lead"><Edit path="pages.contact.intro">{p.intro}</Edit></p>
          <div className="hero-actions" style={{ marginTop: 30 }}>
            <EmailButton email={c.site.email} subject="Collab / Booking Inquiry" className="btn btn-primary" label={c.site.email} />
            <a href={s.instagram} target="_blank" rel="noopener" className="btn btn-ghost">DM on Instagram</a>
          </div>
        </div>
      </section>

      <section className="block connect" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <div className="eyebrow">{p.connectEyebrow}</div>
          <h2 className="display" style={{ fontSize: 'clamp(38px,6vw,76px)' }}>Connect</h2>
          <div className="links-grid">
            {links.map((l, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <a className="lnk" href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener" style={{ width: '100%' }}>
                  {l.label} <span className="arr">→</span>
                </a>
              </Reveal>
            ))}
          </div>
          <div className="support">
            <span className="slab">Support / Tips</span>
            {support.map((l, i) => (<a key={i} href={l.href} target="_blank" rel="noopener">{l.label}</a>))}
          </div>
        </div>
      </section>

      <section className="blocks-section"><div className="wrap"><Blocks path="pages.contact.blocks" blocks={p.blocks} /></div></section>
    </>
  );
}
