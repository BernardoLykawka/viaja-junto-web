import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { ROLE_TO_API, toActivity, toBudget, toDestination, toMember, toPage, toPlace, toTrip, toUser } from './adapters';
import type { Role } from './types';

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: async () => toUser(await api('/users/me')) });

export const useTrips = () =>
  useQuery({ queryKey: ['trips'], queryFn: async () => toPage(await api('/trips', { query: { limit: 100 } }), toTrip) });

export const useTrip = (id: number) =>
  useQuery({ queryKey: ['trip', id], queryFn: async () => toTrip(await api(`/trips/${id}`)) });

export const useTopPlaces = () =>
  useQuery({
    queryKey: ['places', 'featured'],
    queryFn: async () => ((await api<unknown[]>('/places/featured', { anonymous: true })) ?? []).map(toPlace),
  });

export const usePlaces = (q: string) =>
  useQuery({
    queryKey: ['places', 'search', q],
    queryFn: async () => toPage(await api('/places', { anonymous: true, query: { q, size: 24 } }), toPlace),
  });

export const useVisitedCountries = () =>
  useQuery({
    queryKey: ['visited'],
    queryFn: async () => (await api<{ totalVisited: number }>('/places/visited-countries')).totalVisited,
  });

export const useTripDestinations = (tripId: number | undefined) =>
  useQuery({
    queryKey: ['destinations', tripId],
    enabled: tripId != null,
    queryFn: async () => toPage(await api(`/trips/${tripId}/destinations`, { query: { limit: 100 } }), toDestination).data,
  });

export const useTripActivities = (tripId: number) =>
  useQuery({
    queryKey: ['activities', tripId],
    queryFn: async () => toPage(await api(`/trips/${tripId}/activities`, { query: { limit: 100 } }), toActivity).data,
  });

export const useBudget = (tripId: number) =>
  useQuery({ queryKey: ['budget', tripId], queryFn: async () => toBudget(await api(`/trips/${tripId}/budget`)) });

export const useMembers = (tripId: number) =>
  useQuery({
    queryKey: ['members', tripId],
    queryFn: async () => toPage(await api(`/trips/${tripId}/members`, { query: { limit: 100 } }), toMember).data,
  });

/** Depois de mudar o roteiro, o orçamento planejado e a viagem também mudam. */
function useInvalidate(tripId: number) {
  const qc = useQueryClient();
  return () =>
    Promise.all(['destinations', 'activities', 'budget', 'members'].map((k) => qc.invalidateQueries({ queryKey: [k, tripId] }))).then(() =>
      Promise.all([qc.invalidateQueries({ queryKey: ['trip', tripId] }), qc.invalidateQueries({ queryKey: ['trips'] })]),
    );
}

export function useTripMutations(tripId: number) {
  const done = useInvalidate(tripId);
  const opt = { onSuccess: done };
  return {
    addDestination: useMutation({ ...opt, mutationFn: (body: object) => api(`/trips/${tripId}/destinations`, { method: 'POST', body }) }),
    removeDestination: useMutation({ ...opt, mutationFn: (id: number) => api(`/trips/${tripId}/destinations/${id}`, { method: 'DELETE' }) }),
    addActivity: useMutation({
      ...opt,
      mutationFn: ({ destinationId, body }: { destinationId: number; body: object }) =>
        api(`/trips/${tripId}/destinations/${destinationId}/activities`, { method: 'POST', body }),
    }),
    removeActivity: useMutation({ ...opt, mutationFn: (id: number) => api(`/trips/${tripId}/activities/${id}`, { method: 'DELETE' }) }),
    setBudget: useMutation({ ...opt, mutationFn: (orcamentoTotal: number) => api(`/trips/${tripId}/budget`, { method: 'PUT', body: { orcamentoTotal } }) }),
    setRole: useMutation({
      ...opt,
      mutationFn: ({ memberId, role }: { memberId: number; role: Role }) =>
        api(`/trips/${tripId}/members/${memberId}`, { method: 'PATCH', body: { permissao: ROLE_TO_API[role] } }),
    }),
    removeMember: useMutation({ ...opt, mutationFn: (memberId: number) => api(`/trips/${tripId}/members/${memberId}`, { method: 'DELETE' }) }),
    removeTrip: useMutation({ mutationFn: () => api(`/trips/${tripId}`, { method: 'DELETE' }) }),
  };
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: object) => toTrip(await api('/trips', { method: 'POST', body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}
