import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapMarker } from '../lib/types';

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Mapa da viagem (Leaflet + OpenStreetMap). Destinos em círculo Pinheiro maior, atividades em Folha menor;
 * a legenda e a lista ao lado repetem a informação, então a cor não é o único sinal.
 */
export default function TripMap({ markers, label }: { markers: MapMarker[]; label: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current || markers.length === 0) return;
    const map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const destColor = css('--color-primary-strong');
    const actColor = css('--color-primary');
    const surface = css('--color-surface');
    const points: L.LatLngExpression[] = [];
    const destinations = markers.filter((m) => m.type === 'destination');

    for (const m of markers) {
      const isDest = m.type === 'destination';
      L.circleMarker([m.lat, m.lng], {
        radius: isDest ? 11 : 7,
        color: surface,
        weight: 2,
        fillColor: isDest ? destColor : actColor,
        fillOpacity: 1,
      })
        .bindTooltip(`${isDest ? 'Destino' : 'Atividade'}: ${m.label}`)
        .addTo(map);
      points.push([m.lat, m.lng]);
    }
    // Linha tracejada ligando os destinos na ordem do roteiro.
    if (destinations.length > 1) {
      L.polyline(destinations.map((d) => [d.lat, d.lng] as L.LatLngExpression), { color: destColor, weight: 2, dashArray: '6 8' }).addTo(map);
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 13 });
    return () => void map.remove();
  }, [markers]);

  return <div ref={el} className="trip-map" role="img" aria-label={label} />;
}
