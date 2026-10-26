'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import type { Map as LMap, Marker } from 'leaflet';
import { Badge, Button, Card, Icon, Select, Field } from '@/components/ds';
import { ConsentGate } from '@/components/consent/ConsentGate';

export type MapUnit = { id: number; slug: string; name: string; lat: number; lng: number; address: string | null; category: string | null; categoryId: number | null; neighborhood: string | null; phone: string | null; hours: string | null };

const COLORS = ['#005aab', '#1d8dbf', '#00923e', '#a81a13', '#6f6100', '#48545f', '#00618c', '#00702f'];

function Leaflet({ units, selected, onSelect, colorOf }: { units: MapUnit[]; selected: string | null; onSelect: (slug: string) => void; colorOf: (u: MapUnit) => string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !el.current) return;
      map.current?.remove();
      const m = L.map(el.current, { scrollWheelZoom: false }).setView([-23.4336, -45.0838], 12);
      map.current = m;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(m);
      markers.current.clear();
      units.forEach((u) => {
        const icon = L.divIcon({ className: '', html: `<div class="su-marker" style="background:${colorOf(u)}"></div>`, iconSize: [30, 30], iconAnchor: [15, 30] });
        const mk = L.marker([u.lat, u.lng], { icon, title: u.name, keyboard: true, alt: u.name }).addTo(m);
        mk.on('click', () => onSelectRef.current(u.slug));
        markers.current.set(u.slug, mk);
      });
      if (units.length > 1) m.fitBounds(L.latLngBounds(units.map((u) => [u.lat, u.lng] as [number, number])), { padding: [40, 40] });
      else if (units.length === 1) m.setView([units[0].lat, units[0].lng], 15);
    })();
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, [units, colorOf]);

  useEffect(() => {
    const u = units.find((x) => x.slug === selected);
    if (u && map.current) map.current.flyTo([u.lat, u.lng], Math.max(map.current.getZoom(), 15), { duration: 0.5 });
  }, [selected, units]);

  return <div ref={el} className="su-map" role="application" aria-label="Mapa das unidades de saúde de Ubatuba" />;
}

export function UnitsMap({ all, categories, initialSlug }: { all: MapUnit[]; categories: { id: number; name: string }[]; initialSlug?: string }) {
  const [cat, setCat] = useState('');
  const [hood, setHood] = useState('');
  const [selected, setSelected] = useState<string | null>(initialSlug ?? null);
  const hoods = useMemo(() => [...new Set(all.map((u) => u.neighborhood).filter(Boolean))] as string[], [all]);
  const visible = useMemo(() => all.filter((u) => (!cat || String(u.categoryId) === cat) && (!hood || u.neighborhood === hood)), [all, cat, hood]);
  const colorOf = useMemo(() => (u: MapUnit) => COLORS[(categories.findIndex((c) => c.id === u.categoryId) + COLORS.length) % COLORS.length] ?? COLORS[0], [categories]);
  const sel = visible.find((u) => u.slug === selected) ?? null;

  return (
    <div className="su-map-layout">
      <div className="su-stack">
        <Field label="Categoria" htmlFor="m-cat"><Select id="m-cat" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Todas" options={categories.map((c) => ({ value: c.id, label: c.name }))} /></Field>
        <Field label="Bairro" htmlFor="m-hood"><Select id="m-hood" value={hood} onChange={(e) => setHood(e.target.value)} placeholder="Todos" options={hoods} /></Field>
        <p className="su-muted" aria-live="polite" style={{ margin: 0 }}>{visible.length} {visible.length === 1 ? 'unidade' : 'unidades'} no mapa</p>
        <div className="su-map-list" role="list">
          {visible.map((u) => (
            <button key={u.slug} role="listitem" type="button" aria-pressed={selected === u.slug} onClick={() => setSelected(u.slug)}>
              <strong style={{ fontFamily: 'var(--font-display)' }}>{u.name}</strong><br />
              <span className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>{[u.neighborhood, u.category].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="su-stack">
        <ConsentGate what="mapa (OpenStreetMap)">
          <Leaflet units={visible} selected={selected} onSelect={setSelected} colorOf={colorOf} />
        </ConsentGate>
        {sel && (
          <Card accent="brand" aria-live="polite">
            <div className="su-row su-between"><h2 style={{ font: 'var(--text-h4)' }}>{sel.name}</h2>{sel.category && <Badge tone="brand">{sel.category}</Badge>}</div>
            <div className="su-unit__facts">
              <span><Icon name="map-pin" size="sm" />{sel.address || 'Endereço pendente de confirmação oficial'}</span>
              <span><Icon name="clock" size="sm" />{sel.hours || 'Horário pendente de confirmação oficial'}</span>
              <span><Icon name="phone" size="sm" />{sel.phone || 'Telefone pendente de confirmação oficial'}</span>
            </div>
            <Button size="sm" href={`/unidades/${sel.slug}`}>Ver detalhes da unidade</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
