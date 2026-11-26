import { describe, expect, it, vi } from 'vitest';

vi.mock('./auth', () => ({ getAccessToken: async () => null, expireSession: vi.fn() }));
const { ApiError, errorMessage, fieldErrors } = await import('./api');

describe('mensagens de erro', () => {
  it('traduz cada status para uma mensagem em português', () => {
    expect(errorMessage(new ApiError(403, 'FORBIDDEN', 'x'), 'editar esta viagem')).toBe('Você não tem permissão para editar esta viagem.');
    expect(errorMessage(new ApiError(404, 'NOT_FOUND', 'x'))).toMatch(/Não encontramos/);
    expect(errorMessage(new ApiError(429, 'TOO_MANY', 'x', [], 12))).toBe('Muitas tentativas. Tente de novo em 12 segundos.');
    expect(errorMessage(new ApiError(503, 'DOWN', 'x'))).toMatch(/servidor teve um problema/);
    expect(errorMessage(new Error('qualquer'))).toBe('Algo deu errado. Tente de novo.');
  });

  it('separa os erros de validação por campo', () => {
    const err = new ApiError(422, 'VALIDATION', 'x', [{ field: 'nome', issue: 'O nome é obrigatório' }]);
    expect(fieldErrors(err)).toEqual({ nome: 'O nome é obrigatório' });
    expect(errorMessage(err)).toBe('O nome é obrigatório');
  });
});
