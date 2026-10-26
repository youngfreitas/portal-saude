import { Button } from './Button';
import { Icon } from './Icon';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  return (
    <div className="su-share">
      <span className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>Compartilhar:</span>
      <Button size="sm" variant="secondary" external href={`https://wa.me/?text=${t}%20${u}`}><Icon name="message-circle" size="sm" />WhatsApp</Button>
      <Button size="sm" variant="secondary" external href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}><Icon name="share-2" size="sm" />Facebook</Button>
      <Button size="sm" variant="secondary" href={`mailto:?subject=${t}&body=${u}`}><Icon name="mail" size="sm" />E-mail</Button>
    </div>
  );
}
