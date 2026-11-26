import type { Activity, Budget, CatalogActivity, Member, Page, Place, Review, Role, Trip, TripDestination, TripStatus, User } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

const STATUS: Record<string, TripStatus> = { EM_PLANEJAMENTO: 'PLANNING', CONFIRMADA: 'CONFIRMED', CONCLUIDA: 'COMPLETED' };
const ROLE: Record<string, Role> = { CRIADOR: 'OWNER', EDITOR: 'EDITOR', VISUALIZADOR: 'VIEWER' };
export const STATUS_TO_API: Record<TripStatus, string> = { PLANNING: 'EM_PLANEJAMENTO', CONFIRMED: 'CONFIRMADA', COMPLETED: 'CONCLUIDA' };
export const ROLE_TO_API: Record<Role, string> = { OWNER: 'CRIADOR', EDITOR: 'EDITOR', VIEWER: 'VISUALIZADOR' };

const num = (v: Raw): number | null => (v == null ? null : Number(v));

export const toUser = (r: Raw): User => ({ id: r.id, name: r.nome ?? r.name ?? '', email: r.email ?? '', avatarUrl: r.avatarUrl ?? null });
export const toMember = (r: Raw): Member => ({ id: r.id, user: toUser(r.usuario ?? {}), role: ROLE[r.permissao] ?? 'VIEWER' });

export const toTrip = (r: Raw): Trip => ({
  id: r.id,
  name: r.nome,
  description: r.descricao ?? null,
  startDate: r.dataInicio ?? null,
  endDate: r.dataFim ?? null,
  status: STATUS[r.status] ?? 'PLANNING',
  inviteCode: r.codigoConvite ?? null,
  myRole: ROLE[r.permissaoUsuarioAutenticado] ?? 'VIEWER',
  owner: toUser(r.criador ?? {}),
  members: (r.membros ?? []).map(toMember),
  budgetTotal: num(r.orcamentoTotal),
  plannedTotal: num(r.totalPlanejado) ?? 0,
});

export const toPlace = (r: Raw): Place => ({
  id: r.id,
  name: r.nome,
  country: r.pais ?? '',
  isoCode: r.codigoPaisIso ?? null,
  city: r.cidade ?? null,
  description: r.descricao ?? null,
  category: r.categoria ?? null,
  photoUrl: r.fotoUrl ?? null,
  averageRating: num(r.avaliacaoMedia),
  reviewCount: r.totalAvaliacoes ?? 0,
});

export const toDestination = (r: Raw): TripDestination => ({
  id: r.id,
  tripId: r.viagemId ?? null,
  catalogId: r.destinoCatalogoId ?? null,
  name: r.nome,
  country: r.pais ?? null,
  isoCode: r.codigoPaisIso ?? null,
  photoUrl: r.fotoUrl ?? null,
  arrivalDate: r.dataChegada ?? null,
  departureDate: r.dataSaida ?? null,
  order: r.ordemVisita ?? null,
});

export const toActivity = (r: Raw): Activity => ({
  id: r.id,
  destinationId: r.destinoViagemId,
  catalogId: r.catalogoAtividadeId ?? null,
  photoUrl: r.fotoUrl ?? null,
  description: r.descricao ?? null,
  name: r.nome,
  type: r.tipo ?? null,
  place: r.local ?? null,
  dateTime: r.dataHorario ?? null,
  durationMinutes: r.duracaoMinutos ?? null,
  estimatedCost: num(r.custoPrevisto),
});

export const toBudget = (r: Raw): Budget => ({
  total: num(r.orcamentoTotal),
  planned: num(r.totalPlanejado) ?? 0,
  available: num(r.saldoDisponivel),
  percentConsumed: r.percentualConsumidoTotal ?? 0,
  byCategory: (r.gastosPorCategoria ?? []).map((c: Raw) => ({ category: c.categoria, total: num(c.valorTotal) ?? 0, percent: c.percentualConsumido ?? 0 })),
});

export const toReview = (r: Raw): Review => ({
  id: String(r.id),
  author: toUser(r.usuario ?? {}),
  rating: r.nota ?? r.rating ?? 0,
  comment: r.comentario ?? r.comment ?? null,
  createdAt: r.dataCriacao ?? r.createdAt ?? '',
});

export const toCatalogActivity = (r: Raw): CatalogActivity => ({
  id: r.id,
  name: r.nome,
  type: r.tipo ?? null,
  location: r.localizacao ?? null,
  city: r.cidade ?? null,
  country: r.pais ?? null,
  description: r.descricao ?? null,
  photoUrl: r.fotoUrl ?? null,
  averagePrice: num(r.precoMedio),
  averageRating: num(r.avaliacaoMedia),
  reviewCount: r.totalAvaliacoes ?? 0,
});

/** Aceita lista simples, o envelope `{data, meta}` do contrato e o `Page` do Spring (`content`, `totalElements`). */
export function toPage<T>(r: Raw, map: (x: Raw) => T): Page<T> {
  const items: Raw[] = Array.isArray(r) ? r : (r?.data ?? r?.content ?? []);
  // Envelope do contrato: meta.page (1-based) e meta.totalPages. Page do Spring: last.
  const hasMore = r?.meta ? r.meta.page < r.meta.totalPages : r?.last === false;
  return { data: items.map(map), totalItems: r?.meta?.totalItems ?? r?.totalElements ?? items.length, hasMore: !!hasMore };
}
