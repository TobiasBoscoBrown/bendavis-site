import ZoomImg from './ZoomImg';
import Edit from './Edit';
import Short from './Short';

export default function Blocks({ path, blocks }) {
  blocks = blocks || [];
  return (
    <div className="blocks-zone">
      <div className="blocks" data-edit-list={path} data-edit-add={path}>
        {blocks.map((b, i) => (
          <div className="block" data-edit-index={i} data-block-type={b.type} key={i}>
            <button className="block-remove" data-edit-remove={`${path}.${i}`} type="button" aria-label="Remove this block">x</button>
            {b.type === 'text' ? <p className="block-text"><Edit path={`${path}.${i}.text`}>{b.text}</Edit></p> : null}
            {b.type === 'image' ? (
              <figure className="block-img">
                <ZoomImg src={b.src} alt={b.alt || ''} editPath={`${path}.${i}.src`} />
                <figcaption className="cap"><Edit path={`${path}.${i}.caption`}>{b.caption}</Edit></figcaption>
              </figure>
            ) : null}
            {b.type === 'video' ? (
              <div className="block-video">
                <Short id={b.videoId} title="Video" />
                <span className="block-url">Video link or ID: <Edit path={`${path}.${i}.videoId`}>{b.videoId}</Edit></span>
              </div>
            ) : null}
            {b.type === 'link' ? (
              <div className="block-link">
                <a href={b.href || '#'} className="btn btn-primary" target="_blank" rel="noopener"><Edit path={`${path}.${i}.label`}>{b.label}</Edit></a>
                <span className="block-url">Link goes to: <Edit path={`${path}.${i}.href`}>{b.href}</Edit></span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
