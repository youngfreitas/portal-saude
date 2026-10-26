export function Skeleton({ height = 20, width = '100%' }: { height?: number; width?: number | string }) {
  return <div className="su-skeleton" style={{ height, width }} aria-hidden />;
}
