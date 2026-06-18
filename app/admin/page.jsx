'use client';
import { useEffect, useState } from 'react';

export default function Admin() {
  const [status, setStatus] = useState('checking'); // checking | login | in
  const [configured, setConfigured] = useState(true);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { (async () => {
    try {
      const r = await fetch('/api/admin/me'); const j = await r.json();
      setConfigured(j.configured);
      setStatus(j.authed ? 'in' : 'login');
    } catch { setStatus('login'); }
  })(); }, []);

  async function login(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (r.ok) { setPw(''); setStatus('in'); } else setMsg('Wrong password, try again.');
  }
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); setStatus('login'); }

  return (
    <div className="admin">
      <style>{CSS}</style>
      <div className="acenter">
        {status === 'checking' && <div>Loading…</div>}

        {status === 'login' && (
          <form className="acard" onSubmit={login}>
            <div className="abrand">BEN<span>.</span>DAVIS</div>
            <h1>Site editor</h1>
            <p className="amuted">Log in to edit your website.</p>
            {!configured && <p className="awarn">Setup isn’t finished yet (the password or save-key env vars are missing on Vercel). See your onboarding guide, then redeploy.</p>}
            <input className="ainput" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
            <button className="abtn" disabled={busy} type="submit">{busy ? 'Checking…' : 'Log in'}</button>
            {msg && <div className="amsg">{msg}</div>}
          </form>
        )}

        {status === 'in' && (
          <div className="acard">
            <div className="abrand">BEN<span>.</span>DAVIS</div>
            <h1>You’re in ✅</h1>
            <p className="amuted">Now go to your site and look for the <b>✏️ Edit site</b> button in the bottom-right corner. Click it to turn on Edit Mode, then:</p>
            <ul className="alist">
              <li>Click any <b>text</b> to change it</li>
              <li>Click any <b>photo</b> to replace it</li>
              <li><b>Drag photos</b> to reorder them</li>
              <li>Hit <b>Save</b> — your site updates in about a minute</li>
            </ul>
            <a className="abtn" href="/">Go to my site →</a>
            <a className="abtn ghost" href="/admin/quick">Quick edits (email & links)</a>
            <button className="abtn ghost" onClick={logout}>Log out</button>
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
.admin{--cream:#efe9dd;--ink:#15130f;--ink-soft:#3b3730;--blue:#3a9fc7;--blue-deep:#2b85ab;--line:rgba(21,19,15,.16);background:var(--cream);color:var(--ink);min-height:100vh;font-family:'Archivo',system-ui,sans-serif}
.acenter{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.acard{background:#fff;border:1px solid var(--line);border-radius:16px;padding:34px 30px;max-width:400px;width:100%;text-align:center;box-shadow:0 30px 60px -30px rgba(21,19,15,.4)}
.abrand{font-family:'Anton',sans-serif;font-size:22px;letter-spacing:.04em}
.abrand span{color:var(--blue)}
.acard h1{font-size:26px;margin:14px 0 4px}
.amuted{color:var(--ink-soft);font-size:14.5px;margin-bottom:16px;line-height:1.55}
.awarn{background:#fff4d6;border:1px solid #e8c878;color:#7a5b12;font-size:13px;padding:10px 12px;border-radius:8px;margin-bottom:14px;text-align:left}
.alist{text-align:left;margin:0 0 20px;padding-left:20px;color:var(--ink-soft);font-size:14.5px}
.alist li{margin:7px 0}
.ainput{width:100%;border:1.5px solid var(--line);border-radius:9px;padding:12px 13px;font-size:15px;font-family:inherit;margin-bottom:12px}
.ainput:focus{outline:none;border-color:var(--blue)}
.abtn{display:block;width:100%;background:var(--blue);color:#fff;border:none;border-radius:100px;padding:13px;font-weight:800;font-size:15px;letter-spacing:.03em;cursor:pointer;text-decoration:none;margin-top:8px}
.abtn:hover{background:var(--blue-deep)}
.abtn.ghost{background:transparent;color:var(--ink-soft);border:1.5px solid var(--line);margin-top:10px}
.amsg{margin-top:12px;font-size:13px;color:#b23b3b;font-weight:600}
`;
