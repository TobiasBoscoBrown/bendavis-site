'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function parsePath(path) { return path.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p)); }
function setIn(obj, path, val) { const parts = parsePath(path); let o = obj; for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]; o[parts[parts.length - 1]] = val; }
function getIn(obj, path) { const parts = parsePath(path); let o = obj; for (const p of parts) o = o[p]; return o; }
function pageLabel() {
  try {
    const map = { '/': 'Home', '/modeling': 'Modeling', '/acting': 'Acting', '/content-creation': 'Content Creation', '/about': 'About', '/contact': 'Contact' };
    return map[location.pathname] || 'site';
  } catch (e) { return 'site'; }
}
function fileToB64(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(file); }); }

export default function EditMode() {
  const [authed, setAuthed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState('');
  const replacements = useRef({});
  const pathname = usePathname();

  useEffect(() => { fetch('/api/admin/me').then((r) => r.json()).then((j) => { setAuthed(!!j.authed); try { if (j.authed && sessionStorage.getItem('bd-editing') === '1') setEditing(true); } catch (e) {} }).catch(() => {}); }, []);

  function scrapeInto(content) {
    document.querySelectorAll('[data-edit]').forEach((el) => { try { setIn(content, el.getAttribute('data-edit'), el.innerText.replace(/ /g, ' ').trim()); } catch (e) {} });
    Object.entries(replacements.current).forEach(([p, url]) => { try { setIn(content, p, url); } catch (e) {} });
    document.querySelectorAll('[data-edit-list]').forEach((list) => {
      try {
        const path = list.getAttribute('data-edit-list');
        const arr = getIn(content, path);
        const items = [...list.children].filter((c) => c.getAttribute && c.getAttribute('data-edit-index') !== null);
        const order = items.map((c) => Number(c.getAttribute('data-edit-index'))).filter((n) => !Number.isNaN(n));
        if (Array.isArray(arr) && order.length === arr.length) setIn(content, path, order.map((i) => arr[i]));
      } catch (e) {}
    });
  }

  async function loadContent() { const j = await (await fetch('/api/admin/content')).json(); if (!j.ok) throw new Error('auth'); return j.content; }

  async function applyChange(modify, message) {
    setBusy(true); setMsg('Updating...');
    try {
      const content = await loadContent();
      scrapeInto(content);
      await modify(content);
      const r = await fetch('/api/admin/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, message: message || ('Edit ' + pageLabel() + ' page') }) });
      const j = await r.json();
      if (j.ok) { try { sessionStorage.setItem('bd-editing', '1'); } catch (e) {} location.reload(); return; }
      setMsg('Failed: ' + (j.error || '')); setBusy(false);
    } catch (e) { setMsg('Please log in again.'); setBusy(false); }
  }

  function addBlock(type, listPath) {
    if (type === 'text') return applyChange((c) => { getIn(c, listPath).push({ type: 'text', text: 'New text. Click to edit it.' }); }, 'Add text block on ' + pageLabel());
    if (type === 'link') return applyChange((c) => { getIn(c, listPath).push({ type: 'link', label: 'New button', href: 'https://' }); }, 'Add button block on ' + pageLabel());
    if (type === 'video') return applyChange((c) => { getIn(c, listPath).push({ type: 'video', videoId: '' }); }, 'Add video block on ' + pageLabel());
    if (type === 'image') {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = async () => {
        const f = inp.files && inp.files[0]; if (!f) return;
        if (f.size > 8 * 1024 * 1024) { setMsg('Photo over 8MB, pick a smaller one.'); return; }
        setBusy(true); setMsg('Uploading photo...');
        try {
          const b64 = await fileToB64(f);
          const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: f.name, dataBase64: b64 }) });
          const j = await r.json();
          if (j.ok) await applyChange((c) => { getIn(c, listPath).push({ type: 'image', src: j.url, alt: '', caption: 'New photo' }); }, 'Add photo block on ' + pageLabel());
          else { setMsg('Upload failed.'); setBusy(false); }
        } catch (e) { setMsg('Upload failed.'); setBusy(false); }
      };
      inp.click();
    }
  }

  async function uploadReplace(img, file) {
    if (file.size > 8 * 1024 * 1024) { setMsg('Photo is over 8MB, pick a smaller one.'); return; }
    setBusy(true); setMsg('Uploading photo...');
    try {
      const dataBase64 = await fileToB64(file);
      const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, dataBase64 }) });
      const j = await r.json();
      if (j.ok) { img.src = j.url; replacements.current[img.getAttribute('data-edit-img')] = j.url; setDirty(true); setMsg('Photo swapped - hit Save to publish.'); }
      else setMsg('Upload failed: ' + (j.error || ''));
    } catch (e) { setMsg('Upload failed.'); }
    setBusy(false);
  }

  useEffect(() => {
    if (pathname && pathname.startsWith('/admin')) return;
    const texts = document.querySelectorAll('[data-edit]');
    const imgs = document.querySelectorAll('[data-edit-img]');
    const lists = document.querySelectorAll('[data-edit-list]');
    const zones = document.querySelectorAll('[data-edit-add]');

    if (!editing) {
      document.body.classList.remove('em-on');
      texts.forEach((el) => { el.contentEditable = 'false'; el.classList.remove('em-text'); });
      imgs.forEach((el) => el.classList.remove('em-img'));
      lists.forEach((list) => { list.classList.remove('em-list'); [...list.children].forEach((c) => { c.draggable = false; c.classList.remove('em-item'); }); });
      document.querySelectorAll('.block-adder').forEach((a) => a.remove());
      return;
    }

    document.body.classList.add('em-on');
    texts.forEach((el) => { el.contentEditable = 'true'; el.spellcheck = false; el.classList.add('em-text'); });
    imgs.forEach((img) => img.classList.add('em-img'));
    lists.forEach((list) => {
      list.classList.add('em-list');
      [...list.children].forEach((item) => { if (item.getAttribute && item.getAttribute('data-edit-index') !== null) { item.draggable = true; item.classList.add('em-item'); } });
    });
    zones.forEach((zone) => {
      if (zone.querySelector('.block-adder')) return;
      const path = zone.getAttribute('data-edit-add');
      const adder = document.createElement('div');
      adder.className = 'block-adder';
      adder.innerHTML = '<span class="ba-lab">Add a block:</span>' +
        '<button type="button" class="em-add" data-add-block="text" data-add-path="' + path + '">+ Text</button>' +
        '<button type="button" class="em-add" data-add-block="image" data-add-path="' + path + '">+ Photo</button>' +
        '<button type="button" class="em-add" data-add-block="video" data-add-path="' + path + '">+ Video</button>' +
        '<button type="button" class="em-add" data-add-block="link" data-add-path="' + path + '">+ Button</button>';
      zone.appendChild(adder);
    });

    const onInput = () => setDirty(true);
    const onClick = (e) => {
      if (e.target.closest('.em-bar') || e.target.closest('.em-fab')) return;
      const add = e.target.closest('[data-add-block]');
      if (add) { e.preventDefault(); e.stopPropagation(); addBlock(add.getAttribute('data-add-block'), add.getAttribute('data-add-path')); return; }
      const rem = e.target.closest('[data-edit-remove]');
      if (rem) { e.preventDefault(); e.stopPropagation(); const p = rem.getAttribute('data-edit-remove'); if (confirm('Remove this block?')) { const parts = parsePath(p); const idx = parts.pop(); const listPath = parts.join('.'); applyChange((c) => { getIn(c, listPath).splice(idx, 1); }, 'Remove block on ' + pageLabel()); } return; }
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
      document.querySelectorAll('.block-adder').forEach((a) => a.remove());
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, [editing, pathname]);

  async function save() {
    setBusy(true); setMsg('Saving...');
    try {
      const content = await loadContent();
      scrapeInto(content);
      const r = await fetch('/api/admin/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, message: 'Edit ' + pageLabel() + ' page' }) });
      const j = await r.json();
      if (j.ok) { setMsg('Saved! Your site updates in about a minute.'); setDirty(false); replacements.current = {}; }
      else setMsg('Save failed: ' + (j.error || ''));
    } catch (e) { setMsg('Please log in again.'); }
    setBusy(false);
  }

  async function logout() {
    if (dirty && !confirm('You have unsaved changes. Log out anyway?')) return;
    try { sessionStorage.removeItem('bd-editing'); } catch (e) {}
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch (e) {}
    location.reload();
  }

  if (!authed || (pathname && pathname.startsWith('/admin'))) return null;

  return (
    <>
      {!editing ? (
        <button className="em-fab" onClick={() => { try { sessionStorage.setItem('bd-editing', '1'); } catch (e) {} setEditing(true); }} aria-label="Edit site">Edit site</button>
      ) : (
        <div className="em-bar">
          <span className="em-title">Edit mode</span>
          <span className="em-hint">Click text to edit, click a photo to replace, drag to reorder, add blocks below each section</span>
          <span className="em-msg">{msg}</span>
          <a className="em-btn" href="/admin/quick">Quick edits</a>
          <button className="em-btn" onClick={() => { if (!dirty || confirm('Discard unsaved changes?')) { try { sessionStorage.removeItem('bd-editing'); } catch (e) {} location.reload(); } }}>Exit</button>
          <button className="em-btn" onClick={logout}>Log out</button>
          <button className="em-btn em-save" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving...' : dirty ? 'Save' : 'Saved'}</button>
        </div>
      )}
    </>
  );
}
