export default function Short({ id, title }) {
  return (
    <div className="short">
      <iframe
        src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
        title={title || 'YouTube Short'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
