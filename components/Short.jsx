function ytId(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|shorts\/|embed\/|live\/|v=)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : s;
}
export default function Short({ id, title }) {
  const vid = ytId(id);
  if (!vid) return null;
  return (
    <div className="short">
      <iframe
        src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1&playsinline=1`}
        title={title || 'YouTube Short'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
