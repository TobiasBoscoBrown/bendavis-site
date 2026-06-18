import Link from 'next/link';
export default function Footer({ site }) {
  const [b1, b2] = site.brand.split('.');
  return (
    <footer>
      <div className="wrap foot-inner">
        <Link href="/" className="brand">{b1}<span className="accent">.</span>{b2}</Link>
        <div>6'9" &middot; Philadelphia &amp; New York City &middot; Creator, Actor, Model</div>
        <div>&copy; {new Date().getFullYear()} Ben Davis. All rights reserved.</div>
      </div>
    </footer>
  );
}
