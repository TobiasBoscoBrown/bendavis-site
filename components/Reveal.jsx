'use client';
import { useRef, useEffect, useState } from 'react';
export default function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  const d = delay ? ` d${delay}` : '';
  return <Tag ref={ref} className={`reveal${seen ? ' in' : ''}${d} ${className}`}>{children}</Tag>;
}
