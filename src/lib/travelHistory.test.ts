import { describe, expect, it } from 'vitest';
import { buildHistory, hasVisitedPlace } from './travelHistory';
import type { Activity, Trip, TripDestination, TripStatus } from './types';

const trip = (id: number, status: TripStatus): Trip => ({
  id, status, name: `Viagem ${id}`, description: null, startDate: null, endDate: null, inviteCode: null, myRole: 'OWNER',
  owner: { id: 1, name: 'Ana', email: '', avatarUrl: null }, members: [], budgetTotal: null, plannedTotal: 0,
});
const dest = (id: number, name: string, isoCode: string | null, catalogId: number | null, country: string | null = null): TripDestination => ({
  id, tripId: null, name, isoCode, catalogId, country, photoUrl: null, arrivalDate: null, departureDate: null, order: null,
});
const act = (id: number, catalogId: number | null): Activity => ({
  id, catalogId, destinationId: 0, name: '', type: null, place: null, dateTime: null, durationMinutes: null, estimatedCost: null, photoUrl: null, description: null,
});

describe('buildHistory', () => {
  const trips = [trip(1, 'COMPLETED'), trip(2, 'PLANNING')];
  const h = buildHistory(
    trips,
    [[dest(10, 'Rio de Janeiro', 'BRA', 2), dest(11, 'Lisboa', null, null, 'Portugal')], [dest(20, 'Paris', 'FRA', 1), dest(21, 'Rio de Janeiro', 'BRA', 2)]],
    [{ tripId: 1, activities: [act(100, 5), act(101, null)] }, { tripId: 2, activities: [act(200, 10)] }],
  );

  it('pinta como visitados só os países de viagens concluídas (inclusive pelo nome do país)', () => {
    expect([...h.visitedCountries].sort()).toEqual(['BRA', 'PRT']);
  });

  it('marca como planejados os de viagens futuras, sem repetir os já visitados', () => {
    expect([...h.plannedCountries]).toEqual(['FRA']);
  });

  it('só libera avaliar destino e atividade de viagem concluída', () => {
    expect(hasVisitedPlace(h, { id: 2, name: 'Rio de Janeiro', city: 'Rio de Janeiro' })).toBe(true);
    expect(hasVisitedPlace(h, { id: 1, name: 'Paris', city: 'Paris' })).toBe(false);
    expect(h.visitedActivityIds.has(5)).toBe(true);
    expect(h.visitedActivityIds.has(10)).toBe(false);
  });

  it('casa destino livre do roteiro pelo nome', () => {
    expect(hasVisitedPlace(h, { id: 99, name: 'Lisboa', city: 'Lisboa' })).toBe(true);
  });
});
