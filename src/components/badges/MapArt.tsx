import { useMemo } from 'react';
import { geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { CONTINENTS, continentCountries, type ContinentId } from '../../lib/continents';
import { numericToAlpha3 } from '../../lib/countries';

const SIZE = 40;
export type MapArtKind = ContinentId | 'world' | 'brazil';

/**
 * Mapa desenhado com os dados reais do world-atlas, no quadro 40 × 40 da ilustração do selo:
 * um continente, o Brasil ou o mundo inteiro. Os países visitados ficam em Folha.
 */
export default function MapArt({ kind, visited }: { kind: MapArtKind; visited: Set<string> }) {
  const shapes = useMemo(() => {
    const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
    const fc = feature(topo, topo.objects.countries);
    const keep = kind === 'world' ? null : kind === 'brazil' ? new Set(['BRA']) : continentCountries(kind);
    const items = fc.features
      .map((f) => ({ f, a3: f.id != null ? numericToAlpha3(String(f.id)) : null }))
      .filter((x) => x.a3 && x.a3 !== 'ATA' && (!keep || keep.has(x.a3)));

    let projection: GeoProjection;
    if (kind === 'world') {
      projection = geoNaturalEarth1().fitExtent([[0, 6], [SIZE, SIZE - 6]], { type: 'FeatureCollection', features: items.map((x) => x.f) });
    } else {
      const [w, s, e, n] = kind === 'brazil' ? [-74, -34, -34, 6] : CONTINENTS[kind].frame;
      // O d3 trata polígonos na esfera: pontos no sentido horário, senão o recorte vira "o mundo menos isto".
      const frame = { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [[[w, s], [w, n], [e, n], [e, s], [w, s]]] } };
      projection = geoMercator().fitExtent([[1, 1], [SIZE - 1, SIZE - 1]], frame).clipExtent([[0, 0], [SIZE, SIZE]]);
    }
    const path = geoPath(projection);
    return items.map(({ f, a3 }) => ({ a3: a3!, d: path(f) ?? '' }));
  }, [kind]);

  return (
    <g>
      {shapes.map((s) => <path key={s.a3} d={s.d} className={visited.has(s.a3) ? 'map-art-visited' : 'map-art-land'} />)}
    </g>
  );
}
