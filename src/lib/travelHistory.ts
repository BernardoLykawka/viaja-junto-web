import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { api } from './api';
import { toActivity, toDestination, toPage } from './adapters';
import { toAlpha3 } from './countries';
import { useTrips } from './queries';
import type { Activity, Trip, TripDestination } from './types';

/**
 * O que o usuário já viveu e o que ainda vai viver, a partir das viagens dele:
 * - visitado = está numa viagem com situação "Concluída";
 * - planejado = está numa viagem ainda não concluída.
 * Serve ao mapa-múndi e à regra "só avalia quem foi" (destino ou atividade de viagem concluída).
 */
export interface TravelHistory {
  loading: boolean;
  visitedCountries: Set<string>;
  plannedCountries: Set<string>;
  visitedPlaceIds: Set<number>;
  visitedActivityIds: Set<number>;
  visitedPlaceNames: Set<string>;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function useTravelHistory(): TravelHistory {
  const trips = useTrips();
  const list: Trip[] = trips.data?.data ?? [];
  const completed = list.filter((t) => t.status === 'COMPLETED');

  const destinations = useQueries({
    queries: list.map((t) => ({
      queryKey: ['destinations', t.id],
      queryFn: async () => toPage(await api(`/trips/${t.id}/destinations`, { query: { limit: 100 } }), toDestination).data,
    })),
  });
  const activities = useQueries({
    queries: completed.map((t) => ({
      queryKey: ['activities', t.id],
      queryFn: async () => toPage(await api(`/trips/${t.id}/activities`, { query: { limit: 100 } }), toActivity).data,
    })),
  });

  const loading = trips.isLoading || destinations.some((q) => q.isLoading) || activities.some((q) => q.isLoading);
  const destKey = destinations.map((q) => q.dataUpdatedAt).join();
  const actKey = activities.map((q) => q.dataUpdatedAt).join();

  return useMemo(
    () => ({ loading, ...buildHistory(list, list.map((_, i) => destinations[i]?.data ?? []), completed.map((t, i) => ({ tripId: t.id, activities: activities[i]?.data ?? [] }))) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, trips.dataUpdatedAt, destKey, actKey],
  );
}

/**
 * Regra pura (testada em travelHistory.test.ts): `destinationsByTrip[i]` são as paradas de `trips[i]`;
 * só as atividades de viagens concluídas contam como feitas.
 */
export function buildHistory(
  trips: Trip[],
  destinationsByTrip: TripDestination[][],
  completedActivities: { tripId: number; activities: Activity[] }[],
): Omit<TravelHistory, 'loading'> {
  const h: Omit<TravelHistory, 'loading'> = {
    visitedCountries: new Set(),
    plannedCountries: new Set(),
    visitedPlaceIds: new Set(),
    visitedActivityIds: new Set(),
    visitedPlaceNames: new Set(),
  };
  trips.forEach((t, i) => {
    const done = t.status === 'COMPLETED';
    for (const d of destinationsByTrip[i] ?? []) {
      const a3 = toAlpha3(d.isoCode, d.country);
      if (a3) (done ? h.visitedCountries : h.plannedCountries).add(a3);
      if (done) {
        if (d.catalogId != null) h.visitedPlaceIds.add(d.catalogId);
        h.visitedPlaceNames.add(norm(d.name));
      }
    }
  });
  const completedIds = new Set(trips.filter((t) => t.status === 'COMPLETED').map((t) => t.id));
  for (const { tripId, activities } of completedActivities) {
    if (!completedIds.has(tripId)) continue;
    for (const a of activities) if (a.catalogId != null) h.visitedActivityIds.add(a.catalogId);
  }
  // Um país visitado não aparece também como "planejado".
  h.visitedCountries.forEach((c) => h.plannedCountries.delete(c));
  return h;
}

/** Foi a este destino do catálogo numa viagem concluída? Casa pelo vínculo com o catálogo ou pelo nome. */
export const hasVisitedPlace = (h: Pick<TravelHistory, 'visitedPlaceIds' | 'visitedPlaceNames'>, place: { id: number; name: string; city: string | null }) =>
  h.visitedPlaceIds.has(place.id) || h.visitedPlaceNames.has(norm(place.name)) || (!!place.city && h.visitedPlaceNames.has(norm(place.city)));
