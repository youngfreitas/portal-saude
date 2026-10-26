import { Card } from './Card';
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card accent="accent" style={{ padding: 'var(--space-4) var(--space-5)' }}>
      <div className="su-stat">{value}</div>
      <div className="su-stat__label">{label}</div>
    </Card>
  );
}
