'use client';
import { useEffect, useState } from 'react';

const pretty = (k) =>
  String(k).replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());

const isImage = (k, v) =>
  /(image|portrait|src|logo|photo|cover|headshot|guide)/i.test(String(k || '')) ||
  /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(String(v || '')) ||
  /^https?:\/\/.*(githubusercontent|\.(jpg|jpeg|png|webp|gif))/i.test(String(v || ''));

function updateIn(obj, path, val) {
  if (path.length === 0) return val;
  const [head, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[head] = updateIn(obj[head], rest, val);
  return copy;
}

function blankLike(sample) {
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === 'object') {
    const o = {};
    for (const k of Object.keys(sample)) o[k] = blankLike(sample[k]);
    return o;
  }
  if (typeof sample === 'number') return 0;
  return '';
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Field({ value, path, onChange, k, onUpload }) {
  const label = k != null ? pretty(k) : null;

  if (Array.isArray(value)) {
    return (
      <div className="afield">
        {label && <div className="alabel">{label}</div>}
        <div className="aarray">
          {value.map((item, i) => (
            <div className="aitem" key={i}>
              <div className="aitem-head">
                <span>#{i + 1}</span>
                <button type="button" className="arm" onClick={() => onChange(path, value.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <Field value={item} path={[...path, i]} onChange={onChange} onUpload={onUpload} />
            </div>
          ))}
          <button type="button" className="aadd" onClick={() => onChange(path, [...value, blankLike(value[0] ?? '')])}>+ Add {label ? label.replace(/s$/, '') : 'item'}</button>
        </div>
      </div>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div className="afield aobj">
        {label && <div className="alabel agroup">{label}</div>}
        <div className="aobj-body">
          {Object.keys(value).map((key) => (
            <Field key={key} k={key} value={value[key]} path={[...path, key]} onChange={onChange} onUpload={onUpload} />
          ))}
        </div>
      </div>
    );
  }

  const str = value == null ? '' : String(value);

  if (isImage(k, str)) {
    return (
      <div className="afield">
        <div className="alabel">{label}</div>
        <div className="aimg">
          {str ? <img src={str} alt="" /> : <div className="anoimg">No image yet</div>}
          <div className="aimg-controls">
            <label className="afile">
              Upload / Replace photo
              <input type="file" accept="image/*" onChange={(e) => onUpload(e, path)} />
            </label>
            <input className="ainput mono" value={str} placeholder="image link" onChange={(e) => onChange(path, e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  const long = str.length > 58 || str.includes('\n') || /intro|body|paragraph|description|rest|story|text|lead/i.test(String(k || ''));
  return (
    <div className="afield">
      <div className="alabel">{label}</div>
      {long ? (
        <textarea className="ainput" value={str} rows={Math.min(8, Math.max(3, Math.ceil(str.length / 60)))} onChange={(e) => onChange(path, e.target.value)} />
      ) : (
        <input className="ainput" value={str} onChange={(e) => onChange(path, e.target.value)} />
      )}
    </div>
  );
}

export default function Admin() {
  const [status, setStatus] = useState('checking'); // checking | login | editing
  const [configured, setConfigured] = useState(true);
  const [pw, setPw] = useState('');
  const [content, setContent] = useState(null);
  const [orig, setOrig] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { (async () => {
    try {
      const r = await fetch('/api/admin/me'); const j = await r.json();
      setConfigured(j.configured);
      if (j.authed) await loadContent(); else setStatus('login');
    } catch { setStatus('login'); }
  })(); }, []);

  async function loadContent() {
    const r = await fetch('/api/admin/content'); const j = await r.json();
    if (j.ok) { setContent(j.content); setOrig(JSON.stringify(j.content)); setStatus('editing'); }
    else setStatus('login');
  }

  async function login(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (r.ok) { setPw(''); await loadContent(); } else { setMsg('Wrong password, try again.'); }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setStatus('login'); setContent(null);
  }

  const onChange = (path, val) => setContent((c) => updateIn(c, path, val));

  async function onUpload(e, path) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setMsg('That image is over 8MB, please pick a smaller one.'); return; }
    setBusy(true); setMsg('Uploading photo...');
    try {
      const dataBase64 = await fileToBase64(file);
      const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, dataBase64 }) });
      const j = await r.json();
      if (j.ok) { onChange(path, j.url); setMsg('Photo uploaded. Remember to Save changes.'); }
      else setMsg('Upload failed: ' + (j.error || 'unknown'));
    } catch (err) { setMsg('Upload failed.'); }
    setBusy(false);
    e.target.value = '';
  }

  async function save() {
    setBusy(true); setMsg('Saving...');
    const r = await fetch('/api/admin/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
    const j = await r.json();
    setBusy(false);
    if (j.ok) { setOrig(JSON.stringify(content)); setMsg('Saved! Your site updates in about a minute.'); }
    else setMsg('Save failed: ' + (j.error || 'unknown'));
  }

  const dirty = content && JSON.stringify(content) !== orig;

  return (
    <div className="admin">
      <style>{CSS}</style>

      {status === 'checking' && <div className="acenter">Loading…</div>}

      {status === 'login' && (
        <div className="acenter">
          <form className="acard alogin" onSubmit={login}>
            <div className="abrand">BEN<span>.</span>DAVIS</div>
            <h1>Site editor</h1>
            <p className="amuted">Enter your password to edit your website.</p>
            {!configured && <p className="awarn">Heads up: the editor isn’t fully connected yet (missing password or token in settings).</p>}
            <input className="ainput" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
            <button className="btn btn-primary awide" disabled={busy} type="submit">{busy ? 'Checking…' : 'Log in'}</button>
            {msg && <div className="amsg">{msg}</div>}
          </form>
        </div>
      )}

      {status === 'editing' && content && (
        <>
          <div className="abar">
            <div className="abrand">BEN<span>.</span>DAVIS <small>editor</small></div>
            <div className="abar-actions">
              <a href="/" target="_blank" rel="noopener" className="abtn ghost">View site ↗</a>
              <button className="abtn ghost" onClick={logout}>Log out</button>
              <button className="abtn save" onClick={save} disabled={busy || !dirty}>{busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
            </div>
          </div>
          {msg && <div className="atoast">{msg}</div>}
          <div className="aintro">
            <h1>Edit your website</h1>
            <p>Change any text, swap any photo, add or remove gallery photos and links. When you’re done, hit <b>Save changes</b> at the top. Your live site updates within about a minute.</p>
          </div>
          <div className="awrap">
            {Object.keys(content).map((key) => (
              <details className="acard" key={key}>
                <summary>{pretty(key)}</summary>
                <div className="acard-body">
                  <Field value={content[key]} path={[key]} onChange={onChange} onUpload={onUpload} />
                </div>
              </details>
            ))}
          </div>
          <div className="afoot">
            <button className="abtn save big" onClick={save} disabled={busy || !dirty}>{busy ? 'Saving…' : dirty ? 'Save changes' : 'All saved'}</button>
          </div>
        </>
      )}
    </div>
  );
}

const CSS = `
.admin{--cream:#efe9dd;--ink:#15130f;--ink-soft:#3b3730;--blue:#3a9fc7;--blue-deep:#2b85ab;--line:rgba(21,19,15,.16);background:var(--cream);color:var(--ink);min-height:100vh;font-family:'Archivo',system-ui,sans-serif}
.admin *{box-sizing:border-box}
.acenter{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.abrand{font-family:'Anton',sans-serif;font-size:22px;letter-spacing:.04em}
.abrand span{color:var(--blue)}
.abrand small{font-family:'Archivo';font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);margin-left:8px}
.acard{background:#fff;border:1px solid var(--line);border-radius:14px;margin:14px 0;overflow:hidden}
.acard>summary{cursor:pointer;list-style:none;padding:18px 22px;font-family:'Anton',sans-serif;font-size:20px;letter-spacing:.02em;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between}
.acard>summary::-webkit-details-marker{display:none}
.acard>summary::after{content:"＋";color:var(--blue-deep);font-family:'Archivo';font-weight:700}
.acard[open]>summary::after{content:"－"}
.acard[open]>summary{border-bottom:1px solid var(--line)}
.acard-body{padding:18px 22px}
.alogin{padding:34px 30px;max-width:380px;width:100%;text-align:center}
.alogin h1{font-size:26px;margin:14px 0 4px}
.amuted{color:var(--ink-soft);font-size:14px;margin-bottom:18px}
.awarn{background:#fff4d6;border:1px solid #e8c878;color:#7a5b12;font-size:13px;padding:10px 12px;border-radius:8px;margin-bottom:14px}
.ainput{width:100%;border:1.5px solid var(--line);border-radius:9px;padding:11px 13px;font-size:15px;font-family:inherit;background:#fff;color:var(--ink)}
.ainput:focus{outline:none;border-color:var(--blue)}
textarea.ainput{resize:vertical;line-height:1.45}
.ainput.mono{font-size:12px;color:var(--ink-soft);margin-top:8px}
.awide{width:100%;margin-top:14px;justify-content:center}
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:100px;font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;border:none;cursor:pointer}
.btn-primary{background:var(--blue);color:#fff}
.amsg{margin-top:14px;font-size:13px;color:var(--blue-deep);font-weight:600}
.abar{position:sticky;top:0;z-index:20;background:rgba(239,233,221,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:12px 20px;flex-wrap:wrap;gap:10px}
.abar-actions{display:flex;gap:8px;flex-wrap:wrap}
.abtn{border:1.5px solid var(--ink);background:transparent;color:var(--ink);border-radius:100px;padding:9px 16px;font-size:13px;font-weight:700;letter-spacing:.04em;cursor:pointer}
.abtn.ghost:hover{background:var(--ink);color:var(--cream)}
.abtn.save{background:var(--blue);border-color:var(--blue);color:#fff}
.abtn.save:disabled{opacity:.5;cursor:default}
.abtn.big{padding:14px 30px;font-size:15px}
.atoast{position:sticky;top:58px;z-index:19;background:var(--ink);color:var(--cream);text-align:center;padding:9px;font-size:13px;font-weight:600}
.aintro{max-width:900px;margin:26px auto 0;padding:0 20px}
.aintro h1{font-family:'Anton',sans-serif;font-size:34px;text-transform:uppercase}
.aintro p{color:var(--ink-soft);font-size:15px;margin-top:8px;max-width:60ch}
.awrap{max-width:900px;margin:18px auto 0;padding:0 20px}
.afield{margin:14px 0}
.alabel{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px}
.alabel.agroup{color:var(--blue-deep);font-size:13px;margin-bottom:10px}
.aobj{border-left:2px solid var(--line);padding-left:14px;margin-left:2px}
.aarray{display:flex;flex-direction:column;gap:10px}
.aitem{background:var(--cream);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.aitem-head{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:var(--ink-soft);margin-bottom:6px}
.arm{background:none;border:none;color:#b23b3b;font-weight:700;cursor:pointer;font-size:12px}
.aadd{align-self:flex-start;background:none;border:1.5px dashed var(--blue);color:var(--blue-deep);border-radius:100px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer}
.aimg{display:flex;gap:14px;align-items:flex-start}
.aimg img{width:90px;height:112px;object-fit:cover;border-radius:8px;border:1px solid var(--line);background:#fff}
.anoimg{width:90px;height:112px;border:1px dashed var(--line);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--ink-soft);text-align:center}
.aimg-controls{flex:1}
.afile{display:inline-block;background:var(--ink);color:var(--cream);border-radius:100px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer}
.afile input{display:none}
.afoot{max-width:900px;margin:10px auto 60px;padding:0 20px;text-align:center}
`;
