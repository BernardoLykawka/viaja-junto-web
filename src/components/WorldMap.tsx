import { useMemo } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { countryNamePt, numericToAlpha3 } from '../lib/countries';

const WIDTH = 960;
const HEIGHT = 500;

type Country = { id: string; a3: string | null; d: string };

/** Países do world-atlas já projetados uma vez só (o desenho não depende do usuário). */
function useCountries(): Country[] {
  return useMemo(() => {
    const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
    const fc = feature(topo, topo.objects.countries);
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], fc);
    const path = geoPath(projection);
    return fc.features
      .filter((f) => String(f.id) !== '010') // Antártida ocupa muito espaço e ninguém viaja para lá em grupo.
      .map((f) => ({ id: String(f.id ?? (f.properties as { name?: string })?.name), a3: f.id != null ? numericToAlpha3(String(f.id)) : null, d: path(f) ?? '' }));
  }, []);
}

/**
 * Mapa-múndi pintado conforme as viagens: países de viagens concluídas em Folha, de viagens futuras em Sálvia
 * e o resto em Areia. A cor não é o único sinal: a legenda e a lista de países ficam ao lado.
 */
export default function WorldMap({ visited, planned }: { visited: Set<string>; planned: Set<string> }) {
  const countries = useCountries();
  const visitedNames = [...visited].map(countryNamePt).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const label = visited.size
    ? `Mapa-múndi com ${visited.size} ${visited.size === 1 ? 'país visitado' : 'países visitados'}: ${visitedNames.join(', ')}.`
    : 'Mapa-múndi ainda sem países visitados.';

  return (
    <figure className="world-map">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
        {countries.map((c) => {
          const state = c.a3 && visited.has(c.a3) ? 'visited' : c.a3 && planned.has(c.a3) ? 'planned' : 'none';
          return (
            <path key={c.id} d={c.d} className={`country ${state}`}>
              <title>{c.a3 ? countryNamePt(c.a3) : ''}{state === 'visited' ? ' · visitado' : state === 'planned' ? ' · viagem planejada' : ''}</title>
            </path>
          );
        })}
      </svg>
      <figcaption className="world-map-legend type-body-sm">
        <span><i className="swatch visited" aria-hidden /> Visitado ({visited.size})</span>
        <span><i className="swatch planned" aria-hidden /> Viagem planejada ({planned.size})</span>
        <span><i className="swatch none" aria-hidden /> Ainda não</span>
      </figcaption>
      {visitedNames.length > 0 && (
        <ul className="world-map-list" aria-label="Países visitados">
          {visitedNames.map((n) => <li key={n} className="chip static type-label-md">{n}</li>)}
        </ul>
      )}
    </figure>
  );
}
