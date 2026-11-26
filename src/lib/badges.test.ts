import { describe, expect, it } from 'vitest';
import { BADGES, evaluateBadge, evaluateBadges, travelStats, type TravelStats } from './badges';
import { ALL_COUNTRIES, CONTINENT_IDS, continentCountries } from './continents';
import type { Activity, Place, Trip, TripDestination } from './types';

const zeroContinents = Object.fromEntries(CONTINENT_IDS.map((c) => [c, 0])) as TravelStats['byContinent'];
const stats = (over: Partial<TravelStats> = {}): TravelStats => ({
  completedTrips: 0, ownedTrips: 0, countries: new Set(), byContinent: { ...zeroContinents }, wonders: 0, gastronomy: 0, lodgingNights: 0,
  hostelStays: 0, companions: 0, byCategory: {}, brazilDestinations: 0, maxDestinationsInTrip: 0, maxActivitiesInTrip: 0, longestTripDays: 0, reviews: 0, ...over,
});
const badge = (id: string) => BADGES.find((b) => b.id === id)!;

describe('continentes', () => {
  it('cada país está em um continente só e o mundo soma 196', () => {
    const seen = new Set<string>();
    for (const c of CONTINENT_IDS) for (const p of continentCountries(c)) {
      expect(seen.has(p)).toBe(false);
      seen.add(p);
    }
    expect(ALL_COUNTRIES.size).toBe(196);
  });

  it('cada continente tem insígnia e a esmeralda pede todos os países dele', () => {
    for (const c of CONTINENT_IDS) expect(badge(`continente-${c}`).thresholds[3]).toBe(continentCountries(c).size);
    expect(badge('cidadao-do-mundo').thresholds[3]).toBe(196);
  });
});

describe('níveis das insígnias', () => {
  it('fica bloqueada abaixo do bronze e mostra quanto falta', () => {
    const b = evaluateBadge(badge('passaporte'), stats());
    expect(b).toMatchObject({ tier: null, next: { tier: 'bronze', target: 3 }, progress: 0 });
  });

  it('sobe de nível nos limites; a barra mostra quanto do próximo nível já foi feito', () => {
    const b = evaluateBadge(badge('passaporte'), stats({ countries: new Set(['BRA', 'FRA', 'ARG', 'PRT', 'ESP']) }));
    expect(b.tier).toBe('bronze');
    expect(b.next).toEqual({ tier: 'silver', target: 10 });
    expect(b.progress).toBeCloseTo(0.5);
  });

  it('níveis mais altos: noites até 365, gastronomia até 100, viagens até 40', () => {
    expect(badge('hospedagem').thresholds).toEqual([7, 30, 120, 365]);
    expect(badge('gastronomia').thresholds[3]).toBe(100);
    expect(badge('viajante').thresholds[3]).toBe(40);
    expect(badge('praia').thresholds).toEqual([3, 10, 25, 50]);
    expect(evaluateBadge(badge('hospedagem'), stats({ lodgingNights: 365 })).tier).toBe('emerald');
  });

  it('ordena conquistadas (nível mais alto) antes das bloqueadas', () => {
    const list = evaluateBadges(stats({ wonders: 7, completedTrips: 2 }));
    expect(list[0]!.def.id).toBe('maravilhas');
    expect(list[1]!.def.id).toBe('viajante');
    expect(list.at(-1)!.tier).toBeNull();
  });
});

describe('travelStats', () => {
  const trip = (id: number, myRole: Trip['myRole'], memberIds: number[], startDate: string | null = null, endDate: string | null = null): Trip => ({
    id, name: '', description: null, startDate, endDate, status: 'COMPLETED', inviteCode: null, myRole,
    owner: { id: 1, name: 'Eu', email: '', avatarUrl: null }, budgetTotal: null, plannedTotal: 0,
    members: memberIds.map((u) => ({ id: u * 10, role: 'EDITOR', user: { id: u, name: `P${u}`, email: '', avatarUrl: null } })),
  });
  let n = 0;
  const dest = (tripId: number, catalogId: number | null, name: string, isoCode: string | null = null): TripDestination => ({ id: ++n, tripId, catalogId, name, country: null, isoCode, photoUrl: null, arrivalDate: null, departureDate: null, order: null });
  const act = (destinationId: number, name: string, type: string, durationMinutes: number | null = null, catalogId: number | null = null): Activity => ({ id: ++n, destinationId, catalogId, name, type, place: null, dateTime: null, durationMinutes, estimatedCost: null, photoUrl: null, description: null, status: 'DONE' });
  const place = (id: number, category: string): Place => ({ id, name: '', city: null, country: '', isoCode: null, description: null, category, photoUrl: null, averageRating: null, reviewCount: 0 });

  const rio = dest(1, 2, 'Rio de Janeiro', 'BRA');
  const paris = dest(1, 1, 'Paris', 'FRA');
  const cusco = dest(2, null, 'Machu Picchu', 'PER');
  const s = travelStats(
    {
      completedTrips: [trip(1, 'OWNER', [2, 3], '2026-01-01', '2026-01-20'), trip(2, 'EDITOR', [3, 4], '2026-03-01', '2026-03-05')],
      completedDestinations: [rio, paris, cusco, dest(2, 2, 'Rio de Janeiro', 'BRA')],
      completedActivities: [
        act(rio.id, 'Cristo Redentor', 'Passeio'), act(paris.id, 'Jantar no Marais', 'Gastronomia'),
        act(paris.id, 'Auberge Montmartre', 'Hospedagem', 3 * 1440), act(rio.id, 'Hotel Copacabana', 'Hospedagem', 2 * 1440),
      ],
      visitedCountries: new Set(['BRA', 'FRA', 'PER']),
    },
    [place(1, 'cultural'), place(2, 'praia')],
    1,
    4,
  );

  it('conta maravilhas pelo nome da atividade ou do destino', () => {
    expect(s.wonders).toBe(2); // Cristo Redentor + Machu Picchu
  });

  it('conta continentes, Brasil, hostel, noites, companheiros e avaliações', () => {
    expect(s.byContinent).toMatchObject({ americaSul: 2, europa: 1, africa: 0 });
    expect(s).toMatchObject({ brazilDestinations: 1, hostelStays: 1, lodgingNights: 5, companions: 3, gastronomy: 1, reviews: 4, ownedTrips: 1 });
    expect(s.byCategory).toEqual({ praia: 1, cultural: 1 });
  });

  it('guarda os recordes de uma viagem só', () => {
    expect(s).toMatchObject({ maxDestinationsInTrip: 2, maxActivitiesInTrip: 4, longestTripDays: 20 });
  });
});
