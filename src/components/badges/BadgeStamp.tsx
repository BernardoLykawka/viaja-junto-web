import { lazy, Suspense } from 'react';
import { TIER_LABEL } from '../../lib/badges';
import {
  Airplane, Backpack, Bank, Bed, Buildings, CalendarCheck, Crown, ForkKnife, GlobeHemisphereEast, GlobeStand, ListChecks, Lock,
  Mountains, Path, Stamp, Star, TreePalm, UsersThree, type Icon,
} from '@phosphor-icons/react';
import type { BadgeArt, Tier } from '../../lib/badges';
import type { MapArtKind } from './MapArt';

// Os mapas usam o world-atlas (~100 kB): só carregam quando um selo de mapa aparece.
const MapArt = lazy(() => import('./MapArt'));

const ICONS: Partial<Record<BadgeArt, Icon>> = {
  stamp: Stamp, airplane: Airplane, palm: TreePalm, mountains: Mountains, buildings: Buildings, museum: Bank, fork: ForkKnife,
  bed: Bed, people: UsersThree, crown: Crown, star: Star, route: Path, calendar: CalendarCheck, backpack: Backpack,
  list: ListChecks, globe: GlobeStand,
};

/** Selos ilustrados com mapa: continentes, o Brasil e o mundo. */
const mapKind = (art: BadgeArt): MapArtKind | null =>
  art.startsWith('continent:') ? (art.slice('continent:'.length) as MapArtKind) : art === 'world' || art === 'brazil' ? art : null;

/**
 * Cristo Redentor sobre o Corcovado, desenhado à mão (o Phosphor não tem), no quadro de 40 × 40 dos ícones:
 * símbolo das 7 maravilhas do mundo moderno.
 */
function WondersArt() {
  return (
    <g fill="currentColor">
      <circle cx="20" cy="6.2" r="2.6" />
      {/* braços abertos com o manto caindo */}
      <path d="M3 10.4c0-.9.6-1.5 1.5-1.5h31c.9 0 1.5.6 1.5 1.5v1c0 .7-.5 1.2-1.2 1.3l-9.3 1.2-.3 2.3h-12.4l-.3-2.3-9.3-1.2C3.5 12.6 3 12.1 3 11.4z" />
      {/* túnica */}
      <path d="M15.6 15.6h8.8l1.3 15.6h-11.4z" />
      {/* pedestal e o morro */}
      <rect x="14.6" y="31" width="10.8" height="2.4" rx="0.6" />
      <path d="M2 40c4-4 8-5.8 12.6-6.4h10.8C30 34.2 34 36 38 40z" opacity="0.55" />
    </g>
  );
}

const W = 84;
const H = 100;
const R = 3; // raio dos furos do picote

/**
 * Contorno do papel com o picote: um caminho só, com meios-círculos para dentro a cada 8 px nas quatro
 * bordas (percorrido no sentido horário, cada furo é um arco com sweep 0). Antes era uma máscara com 48
 * círculos por selo: pesado, e no Firefox piscava e serrilhava dentro da folha em 3D.
 */
function perforatedPath(): string {
  const top = Array.from({ length: 10 }, (_, i) => 6 + i * 8); // 6 … 78
  const side = Array.from({ length: 12 }, (_, i) => 6 + i * 8); // 6 … 94
  let d = 'M0,0';
  for (const x of top) d += ` H${x - R} A${R},${R} 0 0 0 ${x + R},0`;
  d += ` H${W}`;
  for (const y of side) d += ` V${y - R} A${R},${R} 0 0 0 ${W},${y + R}`;
  d += ` V${H}`;
  for (const x of [...top].reverse()) d += ` H${x + R} A${R},${R} 0 0 0 ${x - R},${H}`;
  d += ' H0';
  for (const y of [...side].reverse()) d += ` V${y + R} A${R},${R} 0 0 0 0,${y - R}`;
  return `${d} Z`;
}
const PAPER = perforatedPath();

/**
 * Selo postal (DESIGN.md › Components › Selos): papel branco com picote nas bordas, moldura na cor do nível,
 * quadro com a ilustração em Pinheiro e faixa com o nome do nível. Bloqueado, o selo fica todo em Areia,
 * com a ilustração apagada e um cadeado.
 */
export function BadgeStamp({ art, tier, size = 84, visitedCountries }: { art: BadgeArt; tier: Tier | null; size?: number; visitedCountries?: Set<string> }) {
  const I = ICONS[art];
  const kind = mapKind(art);
  const state = tier ?? 'locked';
  return (
    <svg className={`stamp stamp-${state}`} width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      {/* Sombra desenhada no próprio selo (sem filtro CSS, que o Firefox renderiza mal em 3D). */}
      <path className="stamp-shadow" d={PAPER} transform="translate(1 2)" />
      <path className="stamp-paper" d={PAPER} />
      <rect className="stamp-frame" x="6" y="6" width="72" height="88" rx="2" />
      <rect className="stamp-panel" x="11" y="11" width="62" height="56" rx="1.5" />
      <rect className="stamp-band" x="11" y="72" width="62" height="17" rx="1.5" />
      {/* Os mapas já vêm recortados no quadro 40 × 40 (clipExtent em MapArt). */}
      <g className="stamp-art" transform="translate(22 19)">
        {art === 'wonders' ? <WondersArt /> : kind ? (
          <Suspense fallback={<GlobeHemisphereEast size={40} weight="duotone" />}>
            <MapArt kind={kind} visited={visitedCountries ?? new Set()} />
          </Suspense>
        ) : I ? <I size={40} weight="duotone" /> : null}
      </g>
      <text className="stamp-label" x={W / 2} y="83.5" textAnchor="middle">{tier ? TIER_LABEL[tier].toUpperCase() : 'BLOQUEADO'}</text>
      {!tier && (
        <g transform="translate(60 48)">
          <circle className="stamp-lock-bg" cx="8" cy="8" r="9" />
          <Lock x={2.5} y={2.5} size={11} weight="fill" className="stamp-lock" />
        </g>
      )}
    </svg>
  );
}
