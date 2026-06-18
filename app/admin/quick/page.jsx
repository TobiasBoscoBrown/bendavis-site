'use client';
import { useEffect, useState } from 'react';

function parsePath(p) { return p.split('.').map((x) => (/^\d+$/.test(x) ? Number(x) : x)); }
function getIn(o, p) { let c = o; for (const k of parsePath(p)) { if (c == null) return ''; c = c[k]; } return c == null ? '' : c; }
function setIn(o, p, v) { const parts = parsePath(p); let c = o; for (let i = 0; i < parts.length - 1; i++) c = c[parts[i]]; c[parts[parts.length - 1]] = v; }
const clone = (o) => JSON.parse(JSON.stringify(o));

const GROUPS = [
  { title: 'Contact', fields: [{ label: 'Booking / contact email', path: 'site.email', type: 'email', hint: 'Where your Book Me and Email buttons send people.' }] },
  { title: 'Social links', fields: [
    { label: 'Instagram', path: 'social.instagram', type: 'url' },
    { label: 'TikTok', path: 'social.tiktok', type: 'url' },
    { label: 'YouTube', path: 'social.youtube', type: 'url' },
    { label: 'Snapchat', path: 'social.snapchat', type: 'url' },
    { label: 'ShopMy', path: 'social.shopmy', type: 'url' },
  ] },
  { title: 'Support / tips links', fields: [
    { label: 'Cash App', path: 'social.cashapp', type: 'url' },
    { label: 'Venmo', path: 'social.venmo', type: 'url' },
    { label: 'PayPal', path: 'social.paypal', type: 'url' },
    { label: 'Amazon Wishlist', path: 'social.wishlist', type: 'url' },
  ] },
  { title: 'Featured promo links', fields: [
    { label: 'Guide button link (Gumroad)', path: 'pages.about.guide.ctaHref', type: 'url' },
    { label: 'StriveSkin button link', path: 'pages.about.partner.ctaHref', type: 'url' },
  ] },
  { title: 'Search & sharing (SEO)', fields: [
    { label: 'Browser tab title', path: 'site.title', type: 'text' },
    { label: 'Search description', path: 'site.description', type: 'textarea' },
  ] },
];

export default function Quick() {
  const [status, setStatus] = useState('checking');
  const [content, setContent] = useState(null);
  const [orig, setOrig] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { (async () => {
    try {
      const me = await (await fetch('/api/admin/me')).json();
      if (!me.authed) { setStatus('login'); return; }
      const j = await (await fetch('/api/admin/content')).json();
      if (j.ok) { setContent(j.content); setOrig(JSON.stringify(j.content)); setStatus('in'); }
      else setStatus('login');
    } catch { setStatus('login'); }
  })(); }, []);

  function update(path, val) { setContent((c) => { const copy = clone(c); setIn(copy, path, val); return copy; }); }
  function addPromo() { setContent((c) => { const copy = clone(c); if (!copy.promoLinks) copy.promoLinks = []; copy.promoLinks.push({ label: 'New promo', href: 'https://' }); return copy; }); }
  function removePromo(i) { setContent((c) => { const copy = clone(c); copy.promoLinks.splice(i, 1); return copy; }); }
  function updatePromo(i, field, val) { setContent((c) => { const copy = clone(c); copy.promoLinks[i][field] = val; return copy; }); }

  async function save() {
    setBusy(true); setMsg('Saving...');
    const r = await fetch('/api/admin/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setOrig(JSON.stringify(content)); setMsg('Saved! Your site updates in about a minute.'); }
    else setMsg('Save failed: ' + (j.error || ''));
  }
  const dirty = content && JSON.stringify(content) !== orig;
  const promos = (content && content.promoLinks) || [];

  return (
    <div className="q">
      <style>{CSS}</style>
      <div className="qbar">
        <div className="qbrand">BEN<span>.</span>DAVIS <small>quick edits</small></div>
        <div className="qactions">
          <a className="qbtn ghost" href="/">Back to site</a>
          {status === 'in' && <button className="qbtn save" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving...' : dirty ? 'Save' : 'Saved'}</button>}
        </div>
      </div>

      {status === 'checking' && <div className="qcenter">Loading...</div>}
      {status === 'login' && (
        <div className="qcenter"><div className="qcard" style={{ textAlign: 'center', maxWidth: 380 }}>
          <h2>Please log in</h2><p className="qmuted">You need to be logged in to edit settings.</p>
          <a className="qbtn save" href="/admin" style={{ display: 'inline-block', marginTop: 8 }}>Go to login</a>
        </div></div>
      )}

      {status === 'in' && content && (
        <div className="qwrap">
          <div className="qintro">
            <h1>Quick edits</h1>
            <p>Your email and link buttons live here (they are not text on the page, so they are easiest to change from this form). Everything else, the words and photos, you edit right on the site in Edit Mode.</p>
          </div>

          {GROUPS.map((g) => (
            <div className="qcard" key={g.title}>
              <h3>{g.title}</h3>
              {g.fields.map((f) => (
                <div className="qfield" key={f.path}>
                  <label>{f.label}{f.hint ? <span className="qhint">{f.hint}</span> : null}</label>
                  {f.type === 'textarea'
                    ? <textarea rows={2} value={getIn(content, f.path)} onChange={(e) => update(f.path, e.target.value)} />
                    : <input type={f.type === 'email' ? 'email' : 'text'} value={getIn(content, f.path)} onChange={(e) => update(f.path, e.target.value)} />}
                </div>
              ))}
            </div>
          ))}

          <div className="qcard">
            <h3>More promo links</h3>
            <p className="qmuted" style={{ marginBottom: 14 }}>Add any extra promo or discount links. They appear as buttons on your Contact page.</p>
            {promos.map((pl, i) => (
              <div className="qpromo" key={i}>
                <div className="qpromo-fields">
                  <div className="qfield"><label>Button label</label><input value={pl.label || ''} onChange={(e) => updatePromo(i, 'label', e.target.value)} /></div>
                  <div className="qfield"><label>Link URL</label><input value={pl.href || ''} onChange={(e) => updatePromo(i, 'href', e.target.value)} /></div>
                </div>
                <button className="qremove" onClick={() => removePromo(i)}>Remove</button>
              </div>
            ))}
            <button className="qbtn save" style={{ display: 'inline-block', marginTop: 6 }} onClick={addPromo}>+ Add promo link</button>
          </div>

          {msg && <div className="qmsg">{msg}</div>}
          <div className="qfoot"><button className="qbtn save big" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving...' : dirty ? 'Save changes' : 'All saved'}</button></div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.q{--cream:#efe9dd;--ink:#15130f;--ink-soft:#3b3730;--blue:#3a9fc7;--blue-deep:#2b85ab;--line:rgba(21,19,15,.16);background:var(--cream);color:var(--ink);min-height:100vh;font-family:'Archivo',system-ui,sans-serif}
.q *{box-sizing:border-box}
.qbar{position:sticky;top:0;z-index:10;background:rgba(239,233,221,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:13px 22px;gap:10px}
.qbrand{font-family:'Anton',sans-serif;font-size:22px;letter-spacing:.04em;white-space:nowrap}
.qbrand span{color:var(--blue)}
.qbrand small{font-family:'Archivo';font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft);margin-left:8px}
.qactions{display:flex;gap:8px}
.qbtn{border:1.5px solid var(--ink);background:transparent;color:var(--ink);border-radius:100px;padding:9px 18px;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none;white-space:nowrap}
.qbtn.ghost:hover{background:var(--ink);color:var(--cream)}
.qbtn.save{background:var(--blue);border-color:var(--blue);color:#fff}
.qbtn.save:disabled{opacity:.5;cursor:default}
.qbtn.big{padding:14px 30px;font-size:15px}
.qcenter{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:24px}
.qcard{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin:16px 0;box-shadow:0 24px 50px -34px rgba(21,19,15,.4)}
.qcard h2{font-size:22px;margin-bottom:6px}
.qcard h3{font-family:'Anton',sans-serif;font-size:19px;text-transform:uppercase;letter-spacing:.02em;margin-bottom:14px}
.qwrap{max-width:680px;margin:0 auto;padding:10px 20px 70px}
.qintro{margin:26px 0 4px}
.qintro h1{font-family:'Anton',sans-serif;font-size:34px;text-transform:uppercase}
.qintro p{color:var(--ink-soft);font-size:15px;margin-top:8px}
.qfield{margin:14px 0}
.qfield label{display:block;font-size:13px;font-weight:800;letter-spacing:.04em;margin-bottom:6px}
.qhint{display:block;font-weight:500;color:var(--ink-soft);font-size:12.5px;letter-spacing:0;margin-top:2px}
.qfield input,.qfield textarea{width:100%;border:1.5px solid var(--line);border-radius:9px;padding:11px 13px;font-size:15px;font-family:inherit;background:#fff;color:var(--ink)}
.qfield input:focus,.qfield textarea:focus{outline:none;border-color:var(--blue)}
.qmuted{color:var(--ink-soft);font-size:14px}
.qmsg{text-align:center;font-weight:700;color:var(--blue-deep);margin:8px 0}
.qfoot{text-align:center;margin-top:8px}
.qpromo{display:flex;gap:12px;align-items:flex-end;border-top:1px solid var(--line);padding-top:12px;margin-top:4px}
.qpromo-fields{flex:1;display:grid;grid-template-columns:1fr 1.3fr;gap:10px}
.qpromo .qfield{margin:0}
.qremove{background:none;border:none;color:#b23b3b;font-weight:700;font-size:13px;cursor:pointer;padding:11px 4px;white-space:nowrap}
@media(max-width:560px){.qpromo{flex-direction:column;align-items:stretch}.qpromo-fields{grid-template-columns:1fr}}
`;
