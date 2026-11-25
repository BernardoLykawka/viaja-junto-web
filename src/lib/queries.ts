import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuth } from './auth';
import { ROLE_TO_API, STATUS_TO_API, toActivity, toBudget, toCatalogActivity, toDestination, toMember, toPage, toPlace, toReview, toTrip, toUser } from './adapters';
import type { Role, TripStatus } from './types';
import { sameCity } from './activityTypes';

export const useMe = () => {
  const { status } = useAuth();
  return useQuery({ queryKey: ['me'], enabled: status === 'authed', queryFn: async () => toUser(await api('/users/me')) });
};

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

export const usePlace = (id: number) =>
  useQuery({ queryKey: ['place', id], queryFn: async () => toPlace(await api(`/places/${id}`, { anonymous: true })) });

export const usePlaceReviews = (id: number) =>
  useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => toPage(await api(`/places/${id}/reviews`, { anonymous: true, query: { limit: 50 } }), toReview),
  });

/**
 * Atividades do catálogo de uma cidade (público). A busca `q` da API casa nome ou cidade; o filtro exato por
 * cidade é feito aqui para "Paris" não trazer atividades com "Paris" só no nome.
 */
export const useCatalogActivities = (city: string | null | undefined) =>
  useQuery({
    queryKey: ['activity-catalog', city],
    enabled: !!city,
    staleTime: 5 * 60_000,
    queryFn: async () =>
      toPage(await api('/activities/catalog', { anonymous: true, query: { q: city, size: 100 } }), toCatalogActivity).data.filter((a) => sameCity(a.city, city)),
  });

export const useCatalogActivity = (id: number) =>
  useQuery({ queryKey: ['catalog-activity', id], queryFn: async () => toCatalogActivity(await api(`/activities/catalog/${id}`, { anonymous: true })) });

export const useActivityReviews = (placeId: number, activityId: number) =>
  useQuery({
    queryKey: ['activity-reviews', activityId],
    queryFn: async () => toPage(await api(`/places/${placeId}/activities/${activityId}/reviews`, { anonymous: true, query: { size: 50 } }), toReview),
  });

export function useCreateActivityReview(placeId: number, activityId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { nota: number; comentario: string | null }) => api(`/places/${placeId}/activities/${activityId}/reviews`, { method: 'POST', body }),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: ['activity-reviews', activityId] }), qc.invalidateQueries({ queryKey: ['catalog-activity', activityId] }), qc.invalidateQueries({ queryKey: ['activity-catalog'] })]),
  });
}

/**
 * Coloca uma atividade do catálogo (passeio, hospedagem...) numa viagem. Se a viagem ainda não tem o destino,
 * cria o destino a partir do catálogo antes (o backend completa país, foto e descrição pelo destinoCatalogoId).
 */
export function useAddCatalogActivityToTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { tripId: number; destinationId: number | null; place: { id: number; name: string }; activity: object }) => {
      let destinationId = v.destinationId;
      if (destinationId == null) {
        const d = toDestination(await api(`/trips/${v.tripId}/destinations`, { method: 'POST', body: { destinoCatalogoId: v.place.id, nome: v.place.name } }));
        destinationId = d.id;
      }
      await api(`/trips/${v.tripId}/destinations/${destinationId}/activities`, { method: 'POST', body: v.activity });
      return { tripId: v.tripId };
    },
    onSuccess: ({ tripId }) =>
      Promise.all(['destinations', 'activities', 'budget', 'trip'].map((k) => qc.invalidateQueries({ queryKey: [k, tripId] }))).then(() => qc.invalidateQueries({ queryKey: ['trips'] })),
  });
}

export function useCreateReview(placeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { nota: number; comentario: string | null }) => api(`/places/${placeId}/reviews`, { method: 'POST', body }),
    onSuccess: () =>
      Promise.all([qc.invalidateQueries({ queryKey: ['reviews', placeId] }), qc.invalidateQueries({ queryKey: ['place', placeId] }), qc.invalidateQueries({ queryKey: ['places'] })]),
  });
}

export interface TripUpdate {
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
}

export function useUpdateTrip(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: TripUpdate) =>
      toTrip(await api(`/trips/${tripId}`, { method: 'PUT', body: { nome: t.name, descricao: t.description, dataInicio: t.startDate, dataFim: t.endDate, status: STATUS_TO_API[t.status] } })),
    onSuccess: (trip) => {
      qc.setQueryData(['trip', tripId], trip);
      return qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useJoinTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, code }: { tripId: number; code: string }) => api(`/trips/${tripId}/members/join`, { method: 'POST', body: { codigoConvite: code } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => toUser(await api('/users/me', { method: 'PATCH', body: { nome: name } })),
    onSuccess: (me) => qc.setQueryData(['me'], me),
  });
}
