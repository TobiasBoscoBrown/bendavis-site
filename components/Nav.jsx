'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const TABS = [
  { href: '/modeling', key: 'modeling' },
  { href: '/acting', key: 'acting' },
  { href: '/content-creation', key: 'content-creation' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
];

export default function Nav({ brand, email, pages }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  const [b1, b2] = brand.split('.');
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand">{b1}<span>.</span>{b2}</Link>
        <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(o => !o)}>
          <i></i><i></i><i></i>
        </button>
        <nav className={`nav-links${open ? ' open' : ''}`}>
          {TABS.map(t => (
            <Link key={t.key} href={t.href} className={path === t.href ? 'active' : ''}>
              {pages[t.key]?.nav || t.key}
            </Link>
          ))}
          <a href={`mailto:${email}?subject=Collab%20%2F%20Booking%20Inquiry`} className="nav-cta">Book Me</a>
        </nav>
      </div>
    </header>
  );
}
