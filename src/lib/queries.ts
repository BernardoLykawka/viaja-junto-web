import { keepPreviousData, useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuth } from './auth';
import { ROLE_TO_API, STATUS_TO_API, toActivity, toBudget, toCatalogActivity, toDestination, toMember, toPage, toPlace, toReview, toTrip, toUser } from './adapters';
import type { MapMarker, Page, Role, TripStatus } from './types';
import { sameCity } from './activityTypes';

export const useMe = () => {
  const { status } = useAuth();
  return useQuery({ queryKey: ['me'], enabled: status === 'authed', queryFn: async () => toUser(await api('/users/me')) });
};

export const useTrips = () => {
  const { status } = useAuth();
  return useQuery({ queryKey: ['trips'], enabled: status === 'authed', queryFn: async () => toPage(await api('/trips', { query: { limit: 100 } }), toTrip) });
};

export const useTrip = (id: number) =>
  useQuery({ queryKey: ['trip', id], queryFn: async () => toTrip(await api(`/trips/${id}`)) });

export const useTopPlaces = () =>
  useQuery({
    queryKey: ['places', 'featured'],
    queryFn: async () => ((await api<unknown[]>('/places/featured', { anonymous: true })) ?? []).map(toPlace),
  });

export const usePlaces = (q: string, categoria: string | null = null) =>
  useQuery({
    queryKey: ['places', 'search', q, categoria],
    queryFn: async () => toPage(await api('/places', { anonymous: true, query: { q, categoria, size: 48 } }), toPlace),
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
    /** PATCH parcial do destino; `ordemVisita` move no roteiro e o backend renumera os outros. */
    updateDestination: useMutation({ ...opt, mutationFn: ({ id, body }: { id: number; body: object }) => api(`/trips/${tripId}/destinations/${id}`, { method: 'PATCH', body }) }),
    addActivity: useMutation({
      ...opt,
      mutationFn: ({ destinationId, body }: { destinationId: number; body: object }) =>
        api(`/trips/${tripId}/destinations/${destinationId}/activities`, { method: 'POST', body }),
    }),
    removeActivity: useMutation({ ...opt, mutationFn: (id: number) => api(`/trips/${tripId}/activities/${id}`, { method: 'DELETE' }) }),
    /** PATCH parcial: só os campos enviados mudam (string vazia apaga local/descrição). */
    updateActivity: useMutation({ ...opt, mutationFn: ({ id, body }: { id: number; body: object }) => api(`/trips/${tripId}/activities/${id}`, { method: 'PATCH', body }) }),
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
    /** Cria a viagem e, se veio um destino do catálogo, já o coloca no roteiro. */
    mutationFn: async ({ trip, place }: { trip: object; place?: object }) => {
      const created = toTrip(await api('/trips', { method: 'POST', body: trip }));
      if (place) await api(`/trips/${created.id}/destinations`, { method: 'POST', body: place });
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export const usePlace = (id: number) =>
  useQuery({ queryKey: ['place', id], queryFn: async () => toPlace(await api(`/places/${id}`, { anonymous: true })) });


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

export const useTopActivities = () =>
  useQuery({
    queryKey: ['activity-catalog', 'featured'],
    queryFn: async () => ((await api<unknown[]>('/activities/catalog/featured', { anonymous: true })) ?? []).map(toCatalogActivity),
  });


/** Marcadores do mapa da viagem: o backend acha as coordenadas no Google Places (com cache). */
export const useTripMap = (tripId: number) =>
  useQuery({
    queryKey: ['trip-map', tripId],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const r = await api<{ markers?: { type: string; id: string; label: string; latitude: number; longitude: number }[] }>(`/trips/${tripId}/map`);
      return (r.markers ?? [])
        .filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))
        .map((m): MapMarker => ({ type: m.type === 'activity' ? 'activity' : 'destination', id: m.id, label: m.label, lat: m.latitude, lng: m.longitude }));
    },
  });

/**
 * Lista paginada com "Carregar mais". `fetchPage(i)` recebe o índice 0-based da página; cada rota converte
 * para o que espera (o Page do Spring usa `page` 0-based, o envelope do contrato usa `page` 1-based).
 */
export function usePaged<T>(key: unknown[], fetchPage: (index: number) => Promise<Page<T>>, enabled = true) {
  const q = useInfiniteQuery({
    queryKey: key,
    enabled,
    initialPageParam: 0,
    // Ao trocar filtro ou busca, a lista anterior fica na tela (esmaecida) até a nova chegar.
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (last, _all, lastParam) => (last.hasMore ? lastParam + 1 : undefined),
  });
  return {
    ...q,
    items: q.data?.pages.flatMap((p) => p.data) ?? [],
    /** Mostrando a lista do filtro anterior enquanto a nova carrega. */
    updating: q.isPlaceholderData && q.isFetching,
    totalItems: q.data?.pages[0]?.totalItems,
  };
}
export type Paged<T> = ReturnType<typeof usePaged<T>>;

const PAGE = 24;

export const usePlacesPaged = (q: string, categoria: string | null) =>
  usePaged(['places', 'paged', q, categoria], async (i) =>
    toPage(await api('/places', { anonymous: true, query: { q, categoria, page: i, size: PAGE } }), toPlace));

export const useActivitiesPaged = (q: string, tipo: string | null) =>
  usePaged(['activity-catalog', 'paged', q, tipo], async (i) =>
    toPage(await api('/activities/catalog', { anonymous: true, query: { q, tipo, page: i, size: PAGE } }), toCatalogActivity));

export const usePlaceReviewsPaged = (placeId: number) =>
  usePaged(['reviews', placeId], async (i) =>
    toPage(await api(`/places/${placeId}/reviews`, { anonymous: true, query: { page: i + 1, limit: 10 } }), toReview));

export const useActivityReviewsPaged = (placeId: number, activityId: number) =>
  usePaged(['activity-reviews', activityId], async (i) =>
    toPage(await api(`/places/${placeId}/activities/${activityId}/reviews`, { anonymous: true, query: { page: i, size: 10 } }), toReview));

/**
 * Quantas avaliações o usuário publicou (selo "Crítico de viagem"). A API não tem "minhas avaliações",
 * então percorre as avaliações públicas de cada destino e atividade do catálogo. O catálogo é pequeno e
 * as respostas ficam em cache; com um catálogo grande isto pede uma rota própria no backend.
 */
export function useMyReviewCount(meId: number | undefined) {
  const places = usePlaces('');
  const activities = useAllCatalogActivities();
  const targets = [
    ...(places.data?.data ?? []).map((p) => ({ key: ['reviews', 'all', 'place', p.id], url: `/places/${p.id}/reviews`, query: { limit: 100 } })),
    ...(activities.data ?? []).map((a) => ({ key: ['reviews', 'all', 'activity', a.id], url: `/places/0/activities/${a.id}/reviews`, query: { size: 100 } })),
  ];
  const results = useQueries({
    queries: targets.map((t) => ({
      queryKey: t.key,
      enabled: meId != null,
      staleTime: 5 * 60_000,
      queryFn: async () => toPage(await api(t.url, { anonymous: true, query: t.query }), toReview).data,
    })),
  });
  return {
    loading: places.isLoading || activities.isLoading || results.some((r) => r.isLoading),
    count: results.reduce((n, r) => n + (r.data ?? []).filter((rv) => rv.author.id === meId).length, 0),
  };
}

/** Todo o catálogo de atividades (público, até 100). Usado pela busca rápida e pelo selo Crítico de viagem. */
export const useAllCatalogActivities = () =>
  useQuery({
    queryKey: ['activity-catalog', 'all'],
    staleTime: 5 * 60_000,
    queryFn: async () => toPage(await api('/activities/catalog', { anonymous: true, query: { size: 100 } }), toCatalogActivity).data,
  });
