import Reveal from './Reveal';

export default function Feed({ videoId, videoTitle, items = [], watchLabel }) {
  return (
    <div className="feed">
      {videoId ? (
        <Reveal className="feed-item feed-video" delay={1}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={videoTitle || 'YouTube Short'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <span className="cap"><b>▶</b> {watchLabel || 'Watch'}</span>
        </Reveal>
      ) : null}
      {items.map((g, i) => (
        <Reveal key={i} className="feed-item" delay={((i + 1) % 3) + 1}>
          <img src={g.src} alt={g.alt} loading="lazy" />
          {g.caption ? <span className="cap">{g.caption}</span> : null}
        </Reveal>
      ))}
    </div>
  );
}
