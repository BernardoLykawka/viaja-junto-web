import { isLodging, nights, normalizeType } from './activityTypes';
import { ALL_COUNTRIES, CONTINENTS, continentCountries, continentOf, type ContinentId } from './continents';
import { daysUntil } from './format';
import { tripPeople } from './members';
import { placeCategory } from './placeCategories';
import type { TravelHistory } from './travelHistory';
import type { Place } from './types';

/**
 * Selos: conquistas calculadas a partir das viagens CONCLUÍDAS (o que ainda é plano não conta) e das
 * avaliações publicadas. Cada uma tem quatro níveis, do mais fácil ao mais difícil: bronze, prata, ouro e
 * esmeralda. Tudo é calculado no navegador; a API ainda não guarda selos.
 */
export const TIERS = ['bronze', 'silver', 'gold', 'emerald'] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_LABEL: Record<Tier, string> = { bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', emerald: 'Esmeralda' };

/** Mantido para quem só precisa da Europa (testes e textos). */
export const EUROPE = [...continentCountries('europa')];

/**
 * As 7 maravilhas do mundo moderno (eleição de 2007). Conta quando aparece no roteiro de uma viagem
 * concluída, como atividade ou como destino; o nome é comparado sem acento e em vários idiomas.
 */
export const WONDERS: { id: string; name: string; match: RegExp }[] = [
  { id: 'cristo', name: 'Cristo Redentor', match: /cristo redentor|christ the redeemer|corcovado/ },
  { id: 'machu-picchu', name: 'Machu Picchu', match: /machu ?picchu/ },
  { id: 'chichen-itza', name: 'Chichén Itzá', match: /chichen ?itza/ },
  { id: 'coliseu', name: 'Coliseu', match: /coliseu|colosseum|colosseo|coliseo/ },
  { id: 'taj-mahal', name: 'Taj Mahal', match: /taj ?mahal/ },
  { id: 'petra', name: 'Petra', match: /\bpetra\b/ },
  { id: 'muralha', name: 'Grande Muralha da China', match: /muralha da china|great wall|grande muralha/ },
];

export type BadgeArt =
  | 'wonders' | 'stamp' | 'world' | 'airplane' | 'palm' | 'mountains' | 'buildings' | 'museum' | 'fork' | 'bed'
  | 'people' | 'crown' | 'star' | 'route' | 'calendar' | 'backpack' | 'list' | 'brazil' | 'globe'
  | `continent:${ContinentId}`;

export type BadgeGroup = 'continentes' | 'estilo' | 'experiencias' | 'especiais';
export const GROUP_LABEL: Record<BadgeGroup, string> = {
  continentes: 'Continentes e países',
  estilo: 'Estilo de viagem',
  experiencias: 'Experiências',
  especiais: 'Especiais',
};

export interface BadgeDef {
  id: string;
  name: string;
  group: BadgeGroup;
  /** O que é preciso fazer, em uma frase. */
  description: string;
  art: BadgeArt;
  /** Quanto pede cada nível: bronze, prata, ouro, esmeralda. */
  thresholds: [number, number, number, number];
  /** Unidade no singular e no plural ("país", "países"). */
  unit: [string, string];
  metric: (s: TravelStats) => number;
}

export interface TravelStats {
  completedTrips: number;
  ownedTrips: number;
  countries: Set<string>;
  /** Países visitados em cada continente. */
  byContinent: Record<ContinentId, number>;
  /** Maravilhas do mundo moderno distintas. */
  wonders: number;
  gastronomy: number;
  lodgingNights: number;
  /** Estadias em hostel, albergue ou hotel cápsula. */
  hostelStays: number;
  companions: number;
  /** Destinos distintos visitados por categoria do catálogo (praia, cidade...). */
  byCategory: Record<string, number>;
  /** Destinos distintos no Brasil. */
  brazilDestinations: number;
  /** Recordes de uma viagem só. */
  maxDestinationsInTrip: number;
  maxActivitiesInTrip: number;
  longestTripDays: number;
  /** Avaliações publicadas (destinos e atividades). */
  reviews: number;
}

const total = (id: ContinentId) => continentCountries(id).size;

const continentBadge = (id: ContinentId, thresholds: [number, number, number, number], name: string, description: string): BadgeDef => ({
  id: `continente-${id}`,
  name,
  group: 'continentes',
  description,
  art: `continent:${id}`,
  thresholds,
  unit: ['país', 'países'],
  metric: (s) => s.byContinent[id],
});

export const BADGES: BadgeDef[] = [
  // ---------- Continentes e países ----------
  continentBadge('europa', [3, 10, 25, total('europa')], 'Eurotrip', `Viaje pela Europa. A esmeralda é para quem conheceu os ${total('europa')} países.`),
  continentBadge('africa', [2, 8, 25, total('africa')], 'Safári africano', `Conheça a África, do Marrocos à África do Sul. Esmeralda: os ${total('africa')} países.`),
  continentBadge('asia', [3, 10, 25, total('asia')], 'Rota da Seda', `Explore a Ásia, do Oriente Médio ao Japão. Esmeralda: os ${total('asia')} países.`),
  continentBadge('americaSul', [2, 5, 9, total('americaSul')], 'Sul-americano', `Percorra a América do Sul. Esmeralda: os ${total('americaSul')} países.`),
  continentBadge('americaNorte', [2, 6, 14, total('americaNorte')], 'De costa a costa', `Viaje pela América do Norte, Central e Caribe. Esmeralda: os ${total('americaNorte')} países.`),
  continentBadge('oceania', [1, 3, 7, total('oceania')], 'Terra dos cangurus', `Chegue à Oceania, da Austrália às ilhas do Pacífico. Esmeralda: os ${total('oceania')} países.`),
  { id: 'cidadao-do-mundo', name: 'Cidadão do mundo', group: 'continentes', art: 'world', description: `Conheça todos os ${ALL_COUNTRIES.size} países do mundo. Só para os mais persistentes.`, thresholds: [25, 75, 150, ALL_COUNTRIES.size], unit: ['país', 'países'], metric: (s) => s.countries.size },
  { id: 'passaporte', name: 'Passaporte carimbado', group: 'continentes', art: 'stamp', description: 'Visite países diferentes. Cada um é um carimbo novo.', thresholds: [3, 10, 25, 50], unit: ['país', 'países'], metric: (s) => s.countries.size },
  { id: 'seis-continentes', name: 'Volta ao mundo', group: 'continentes', art: 'globe', description: 'Pise em continentes diferentes. A esmeralda é para quem esteve nos seis.', thresholds: [2, 3, 5, 6], unit: ['continente', 'continentes'], metric: (s) => Object.values(s.byContinent).filter((n) => n > 0).length },

  // ---------- Estilo de viagem ----------
  { id: 'praia', name: 'Pé na areia', group: 'estilo', art: 'palm', description: 'Visite destinos de praia.', thresholds: [3, 10, 25, 50], unit: ['praia', 'praias'], metric: (s) => s.byCategory.praia ?? 0 },
  { id: 'natureza', name: 'Explorador da natureza', group: 'estilo', art: 'mountains', description: 'Visite destinos de natureza, montanha ou neve.', thresholds: [3, 10, 25, 50], unit: ['destino', 'destinos'], metric: (s) => (s.byCategory.natureza ?? 0) + (s.byCategory.montanha ?? 0) + (s.byCategory.neve ?? 0) },
  { id: 'cidade', name: 'Selva de pedra', group: 'estilo', art: 'buildings', description: 'Visite grandes cidades.', thresholds: [3, 10, 25, 50], unit: ['cidade', 'cidades'], metric: (s) => s.byCategory.cidade ?? 0 },
  { id: 'cultural', name: 'Alma cultural', group: 'estilo', art: 'museum', description: 'Visite destinos culturais, cheios de história e museus.', thresholds: [3, 10, 25, 50], unit: ['destino', 'destinos'], metric: (s) => s.byCategory.cultural ?? 0 },
  { id: 'brasil', name: 'Brasil de ponta a ponta', group: 'estilo', art: 'brazil', description: 'Conheça destinos diferentes dentro do Brasil.', thresholds: [3, 8, 15, 27], unit: ['destino brasileiro', 'destinos brasileiros'], metric: (s) => s.brazilDestinations },
  { id: 'mochileiro', name: 'Mochileiro', group: 'estilo', art: 'backpack', description: 'Fique em hostels, albergues ou hotéis cápsula.', thresholds: [1, 5, 15, 40], unit: ['estadia', 'estadias'], metric: (s) => s.hostelStays },

  // ---------- Experiências ----------
  { id: 'maravilhas', name: '7 Maravilhas', group: 'experiencias', art: 'wonders', description: `Visite as 7 maravilhas do mundo moderno: ${WONDERS.map((w) => w.name).join(', ')}.`, thresholds: [1, 3, 5, 7], unit: ['maravilha', 'maravilhas'], metric: (s) => s.wonders },
  { id: 'gastronomia', name: 'Bom de garfo', group: 'experiencias', art: 'fork', description: 'Faça experiências de gastronomia nas viagens.', thresholds: [5, 20, 50, 100], unit: ['experiência', 'experiências'], metric: (s) => s.gastronomy },
  { id: 'hospedagem', name: 'Check-in', group: 'experiencias', art: 'bed', description: 'Some noites de hospedagem. A esmeralda é um ano inteiro fora de casa.', thresholds: [7, 30, 120, 365], unit: ['noite', 'noites'], metric: (s) => s.lodgingNights },
  { id: 'critico', name: 'Crítico de viagem', group: 'experiencias', art: 'star', description: 'Avalie destinos e atividades que você conheceu e ajude a comunidade.', thresholds: [1, 10, 30, 75], unit: ['avaliação', 'avaliações'], metric: (s) => s.reviews },

  // ---------- Especiais ----------
  { id: 'viajante', name: 'Viajante frequente', group: 'especiais', art: 'airplane', description: 'Conclua viagens.', thresholds: [2, 8, 20, 40], unit: ['viagem', 'viagens'], metric: (s) => s.completedTrips },
  { id: 'organizador', name: 'Organizador', group: 'especiais', art: 'crown', description: 'Crie e conclua viagens como dono(a) do roteiro.', thresholds: [1, 5, 15, 30], unit: ['viagem', 'viagens'], metric: (s) => s.ownedTrips },
  { id: 'turma', name: 'Turma da viagem', group: 'especiais', art: 'people', description: 'Viaje com pessoas diferentes.', thresholds: [2, 6, 15, 30], unit: ['companheiro', 'companheiros'], metric: (s) => s.companions },
  { id: 'multidestino', name: 'Multidestino', group: 'especiais', art: 'route', description: 'Junte vários destinos numa viagem só.', thresholds: [2, 4, 6, 10], unit: ['destino na mesma viagem', 'destinos na mesma viagem'], metric: (s) => s.maxDestinationsInTrip },
  { id: 'longa-jornada', name: 'Longa jornada', group: 'especiais', art: 'calendar', description: 'Faça uma viagem longa, do primeiro ao último dia.', thresholds: [7, 15, 30, 90], unit: ['dia', 'dias'], metric: (s) => s.longestTripDays },
  { id: 'roteiro-cheio', name: 'Roteiro cheio', group: 'especiais', art: 'list', description: 'Planeje muitas atividades numa viagem só.', thresholds: [5, 12, 25, 50], unit: ['atividade na mesma viagem', 'atividades na mesma viagem'], metric: (s) => s.maxActivitiesInTrip },
];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const HOSTEL = /hostel|albergue|auberge|capsula|capsule|dormitorio/;

type HistoryPart = Pick<TravelHistory, 'completedTrips' | 'completedDestinations' | 'completedActivities' | 'visitedCountries'>;

/** Junta o histórico de viagens (e as avaliações) num resumo que as regras dos selos leem. */
export function travelStats(h: HistoryPart, places: Place[], meId: number | undefined, reviews = 0): TravelStats {
  const placeById = new Map(places.map((p) => [p.id, p]));
  const destKey = (d: { catalogId: number | null; name: string }) => (d.catalogId != null ? `c${d.catalogId}` : `n${norm(d.name)}`);

  // Destinos distintos por categoria e no Brasil.
  const byCategory: Record<string, number> = {};
  const seen = new Set<string>();
  const brazil = new Set<string>();
  for (const d of h.completedDestinations) {
    const key = destKey(d);
    const iso = d.isoCode ?? (d.catalogId != null ? placeById.get(d.catalogId)?.isoCode : null) ?? null;
    if (iso === 'BRA' || norm(d.country ?? '') === 'brasil') brazil.add(key);
    if (seen.has(key)) continue;
    seen.add(key);
    const cat = placeCategory(d.catalogId != null ? placeById.get(d.catalogId)?.category : null)?.id;
    if (cat) byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  // Países por continente.
  const byContinent = Object.fromEntries(Object.keys(CONTINENTS).map((id) => [id, 0])) as Record<ContinentId, number>;
  for (const c of h.visitedCountries) {
    const ct = continentOf(c);
    if (ct) byContinent[ct] += 1;
  }

  // Maravilhas: nomes de atividades e destinos das viagens concluídas.
  const names = [...h.completedActivities.map((a) => `${a.name} ${a.place ?? ''}`), ...h.completedDestinations.map((d) => d.name)].map(norm);
  const wonders = WONDERS.filter((w) => names.some((n) => w.match.test(n))).length;

  // Recordes por viagem (a atividade chega à viagem pelo destino dela).
  const tripOfDestination = new Map(h.completedDestinations.map((d) => [d.id, d.tripId]));
  const destPerTrip = new Map<number, number>();
  for (const d of h.completedDestinations) if (d.tripId != null) destPerTrip.set(d.tripId, (destPerTrip.get(d.tripId) ?? 0) + 1);
  const actPerTrip = new Map<number, number>();
  for (const a of h.completedActivities) {
    const t = tripOfDestination.get(a.destinationId);
    if (t != null) actPerTrip.set(t, (actPerTrip.get(t) ?? 0) + 1);
  }
  const tripDays = h.completedTrips.map((t) => (t.startDate && t.endDate ? daysUntil(t.endDate, new Date(`${t.startDate}T00:00:00`)) + 1 : 0));

  const lodging = h.completedActivities.filter((a) => isLodging(a.type));
  const companions = new Set(h.completedTrips.flatMap((t) => tripPeople(t).map((m) => m.user.id)).filter((id) => id !== meId));

  return {
    completedTrips: h.completedTrips.length,
    ownedTrips: h.completedTrips.filter((t) => t.myRole === 'OWNER').length,
    countries: h.visitedCountries,
    byContinent,
    wonders,
    gastronomy: h.completedActivities.filter((a) => normalizeType(a.type) === 'Gastronomia').length,
    lodgingNights: lodging.reduce((sum, a) => sum + (nights(a.durationMinutes) ?? 1), 0),
    hostelStays: lodging.filter((a) => HOSTEL.test(norm(`${a.name} ${a.place ?? ''}`))).length,
    companions: companions.size,
    byCategory,
    brazilDestinations: brazil.size,
    maxDestinationsInTrip: Math.max(0, ...destPerTrip.values()),
    maxActivitiesInTrip: Math.max(0, ...actPerTrip.values()),
    longestTripDays: Math.max(0, ...tripDays),
    reviews,
  };
}

export interface BadgeProgress {
  def: BadgeDef;
  value: number;
  /** Nível conquistado (null = ainda bloqueada). */
  tier: Tier | null;
  /** Próximo nível e quanto ele pede (null quando já é esmeralda). */
  next: { tier: Tier; target: number } | null;
  /** 0 a 1: quanto do próximo nível já foi feito (bate com o texto "3 de 5"). */
  progress: number;
}

export function evaluateBadge(def: BadgeDef, stats: TravelStats): BadgeProgress {
  const value = def.metric(stats);
  let reached = -1;
  def.thresholds.forEach((t, i) => { if (value >= t) reached = i; });
  const tier = reached >= 0 ? TIERS[reached]! : null;
  const nextIndex = reached + 1;
  if (nextIndex >= TIERS.length) return { def, value, tier, next: null, progress: 1 };
  const target = def.thresholds[nextIndex]!;
  return { def, value, tier, next: { tier: TIERS[nextIndex]!, target }, progress: Math.max(0, Math.min(1, value / target)) };
}

/** Todos os selos, conquistados primeiro (nível mais alto antes) e depois os mais perto de sair. */
export function evaluateBadges(stats: TravelStats): BadgeProgress[] {
  const rank = (b: BadgeProgress) => (b.tier ? TIERS.indexOf(b.tier) + 1 : 0);
  return BADGES.map((d) => evaluateBadge(d, stats)).sort((a, b) => rank(b) - rank(a) || b.progress - a.progress);
}

export const unitLabel = (def: BadgeDef, n: number) => `${n} ${n === 1 ? def.unit[0] : def.unit[1]}`;
