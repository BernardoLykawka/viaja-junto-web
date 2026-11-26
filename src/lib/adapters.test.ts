import { describe, expect, it } from 'vitest';
import { toPage, toTrip } from './adapters';

describe('toTrip', () => {
  it('traduz o JSON em português da API para o modelo do app', () => {
    const t = toTrip({
      id: 1, nome: 'Eurotrip', dataInicio: '2027-03-12', dataFim: '2027-04-02', status: 'CONCLUIDA',
      codigoConvite: 'X1', permissaoUsuarioAutenticado: 'CRIADOR', orcamentoTotal: '12000.50', totalPlanejado: 300,
      criador: { id: 7, nome: 'Ana', email: 'a@x' },
      membros: [{ id: 9, usuario: { id: 8, nome: 'Bia' }, permissao: 'VISUALIZADOR' }],
    });
    expect(t).toMatchObject({ name: 'Eurotrip', status: 'COMPLETED', myRole: 'OWNER', budgetTotal: 12000.5, plannedTotal: 300, inviteCode: 'X1' });
    expect(t.members[0]).toMatchObject({ id: 9, role: 'VIEWER', user: { name: 'Bia' } });
  });

  it('usa valores seguros quando faltam campos', () => {
    const t = toTrip({ id: 2, nome: 'Sem nada' });
    expect(t).toMatchObject({ status: 'PLANNING', myRole: 'VIEWER', budgetTotal: null, plannedTotal: 0, members: [] });
  });
});

describe('toPage', () => {
  const id = (x: unknown) => x;

  it('entende o envelope {data, meta} do contrato', () => {
    expect(toPage({ data: [1, 2], meta: { page: 1, totalPages: 3, totalItems: 5 } }, id)).toEqual({ data: [1, 2], totalItems: 5, hasMore: true });
    expect(toPage({ data: [5], meta: { page: 3, totalPages: 3, totalItems: 5 } }, id).hasMore).toBe(false);
  });

  it('entende o Page do Spring (content, totalElements, last)', () => {
    expect(toPage({ content: ['a'], totalElements: 30, last: false }, id)).toEqual({ data: ['a'], totalItems: 30, hasMore: true });
    expect(toPage({ content: ['a'], totalElements: 1, last: true }, id).hasMore).toBe(false);
  });

  it('entende uma lista simples', () => {
    expect(toPage([1, 2, 3], id)).toEqual({ data: [1, 2, 3], totalItems: 3, hasMore: false });
  });
});
