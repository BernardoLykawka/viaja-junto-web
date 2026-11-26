import { describe, expect, it } from 'vitest';
import { parseInvite } from './invite';

describe('parseInvite', () => {
  it('lê o id da viagem e o código de um link de convite', () => {
    expect(parseInvite('http://localhost:5173/convite/12?codigo=EUR2026CODE1')).toEqual({ tripId: 12, code: 'EUR2026CODE1' });
  });

  it('aceita o código vindo depois de outros parâmetros e decodifica', () => {
    expect(parseInvite('https://app/convite/3?x=1&codigo=AB%2DC9')).toEqual({ tripId: 3, code: 'AB-C9' });
  });

  it('aceita só o código, com viagem 0 (o backend acha a viagem pelo código)', () => {
    expect(parseInvite('  RIO2027CODE2 ')).toEqual({ tripId: 0, code: 'RIO2027CODE2' });
  });

  it('recusa texto vazio ou que não parece código', () => {
    expect(parseInvite('')).toBeNull();
    expect(parseInvite('abc')).toBeNull();
    expect(parseInvite('código com espaço')).toBeNull();
  });
});
