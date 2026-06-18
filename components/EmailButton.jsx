'use client';
import { useState } from 'react';

export default function EmailButton({ email, subject = '', className = 'btn btn-primary', label }) {
  const [copied, setCopied] = useState(false);
  const click = () => {
    try { navigator.clipboard?.writeText(email); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2600);
    // also try to open a mail app (silently does nothing if none is set up)
    try {
      const a = document.createElement('a');
      a.href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
      a.click();
    } catch {}
  };
  return (
    <button type="button" onClick={click} className={className} aria-label={`Email ${email}`}>
      {copied ? 'Email copied ✓' : (label || email)}
    </button>
  );
}
