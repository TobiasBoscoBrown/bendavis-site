'use client';
import { useState, useEffect, useRef } from 'react';

function parsePath(path) { return path.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p)); }
function setIn(obj, path, val) { const parts = parsePath(path); let o = obj; for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]; o[parts[parts.length - 1]] = val; }
function getIn(obj, path) { const parts = parsePath(path); let o = obj; for (const p of parts) o = o[p]; return o; }
function fileToB64(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(file); }); }

export default function EditMode() {
  const [authed, setAuthed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState('');
  const replacements = useRef({});

  useEffect(() => { fetch('/api/admin/me').then((r) => r.json()).then((j) => setAuthed(!!j.authed)).catch(() => {}); }, []);

  useEffect(() => {
    const texts = document.querySelectorAll('[data-edit]');
    const imgs = document.querySelectorAll('[data-edit-img]');
    const lists = document.querySelectorAll('[data-edit-list]');

    if (!editing) {
      document.body.classList.remove('em-on');
      texts.forEach((el) => { el.contentEditable = 'false'; el.classList.remove('em-text'); });
      imgs.forEach((el) => el.classList.remove('em-img'));
      lists.forEach((list) => { list.classList.remove('em-list'); [...list.children].forEach((c) => { c.draggable = false; c.classList.remove('em-item'); }); });
      return;
    }

    document.body.classList.add('em-on');
    texts.forEach((el) => { el.contentEditable = 'true'; el.spellcheck = false; el.classList.add('em-text'); });
    imgs.forEach((img) => img.classList.add('em-img'));
    lists.forEach((list) => { list.classList.add('em-list'); [...list.children].forEach((item) => { item.draggable = true; item.classList.add('em-item'); }); });

    const onInput = () => setDirty(true);
    // One click handler: replace photos, freeze navigation, allow text editing (even inside links)
    const onClick = (e) => {
      if (e.target.closest('.em-bar') || e.target.closest('.em-fab')) return;
      const img = e.target.closest('[data-edit-img]');
      if (img) {
        e.preventDefault(); e.stopPropagation();
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = async () => { const f = inp.files && inp.files[0]; if (f) await uploadReplace(img, f); };
        inp.click();
        return;
      }
      const editable = e.target.closest('[data-edit]');
      if (editable) { const a = e.target.closest('a'); if (a) e.preventDefault(); return; }
      const nav = e.target.closest('a, button, [role="button"]');
      if (nav) { e.preventDefault(); e.stopPropagation(); }
    };

    let dragEl = null;
    const onDragStart = (e) => { const it = e.target.closest('.em-item'); if (!it) return; dragEl = it; setTimeout(() => it.classList.add('em-dragging'), 0); };
    const onDragOver = (e) => {
      const list = e.target.closest('.em-list');
      if (!list || !dragEl || !list.contains(dragEl)) return;
      e.preventDefault();
      const items = [...list.querySelectorAll('.em-item:not(.em-dragging)')];
      let after = null, min = Infinity;
      for (const child of items) {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - box.top - box.height / 2;
        const dist = Math.abs(offset) + Math.abs(e.clientX - box.left - box.width / 2);
        if (offset < 0 && dist < min) { min = dist; after = child; }
      }
      if (after == null) list.appendChild(dragEl); else list.insertBefore(dragEl, after);
    };
    const onDrop = (e) => { e.preventDefault(); setDirty(true); };
    const onDragEnd = () => { if (dragEl) { dragEl.classList.remove('em-dragging'); dragEl = null; setDirty(true); } };

    document.addEventListener('input', onInput, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragend', onDragEnd);
    return () => {
      document.body.classList.remove('em-on');
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, [editing]);

  async function uploadReplace(img, file) {
    if (file.size > 8 * 1024 * 1024) { setMsg('Photo is over 8MB, pick a smaller one.'); return; }
    setBusy(true); setMsg('Uploading photo…');
    try {
      const dataBase64 = await fileToB64(file);
      const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, dataBase64 }) });
      const j = await r.json();
      if (j.ok) { img.src = j.url; replacements.current[img.getAttribute('data-edit-img')] = j.url; setDirty(true); setMsg('Photo swapped — hit Save to publish.'); }
      else setMsg('Upload failed: ' + (j.error || ''));
    } catch { setMsg('Upload failed.'); }
    setBusy(false);
  }

  async function save() {
    setBusy(true); setMsg('Saving…');
    try {
      const cr = await fetch('/api/admin/content'); const cj = await cr.json();
      if (!cj.ok) { setMsg('Could not load content (try logging in again).'); setBusy(false); return; }
      const content = cj.content;
      document.querySelectorAll('[data-edit]').forEach((el) => { try { setIn(content, el.getAttribute('data-edit'), el.innerText.replace(/ /g, ' ').trim()); } catch {} });
      Object.entries(replacements.current).forEach(([p, url]) => { try { setIn(content, p, url); } catch {} });
      document.querySelectorAll('[data-edit-list]').forEach((list) => {
        try {
          const path = list.getAttribute('data-edit-list'); const arr = getIn(content, path);
          const order = [...list.children].map((c) => Number(c.getAttribute('data-edit-index'))).filter((n) => !Number.isNaN(n));
          if (order.length === arr.length) setIn(content, path, order.map((i) => arr[i]));
        } catch {}
      });
      const r = await fetch('/api/admin/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      const j = await r.json();
      if (j.ok) { setMsg('Saved! Your site updates in about a minute.'); setDirty(false); replacements.current = {}; }
      else setMsg('Save failed: ' + (j.error || ''));
    } catch { setMsg('Save failed.'); }
    setBusy(false);
  }

  async function logout() {
    if (dirty && !confirm('You have unsaved changes. Log out anyway?')) return;
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
    location.reload();
  }

  if (!authed) return null;

  return (
    <>
      {!editing ? (
        <button className="em-fab" onClick={() => setEditing(true)} aria-label="Edit site">Edit site</button>
      ) : (
        <div className="em-bar">
          <span className="em-title">Edit mode</span>
          <span className="em-hint">Click text to edit, click a photo to replace, drag photos to reorder</span>
          <span className="em-msg">{msg}</span>
          <a className="em-btn" href="/admin/quick">Quick edits</a>
          <button className="em-btn" onClick={() => { if (!dirty || confirm('Discard unsaved changes?')) location.reload(); }}>Exit</button>
          <button className="em-btn" onClick={logout}>Log out</button>
          <button className="em-btn em-save" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving...' : dirty ? 'Save' : 'Saved'}</button>
        </div>
      )}
    </>
  );
}
