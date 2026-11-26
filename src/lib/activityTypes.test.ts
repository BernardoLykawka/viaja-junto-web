import { describe, expect, it } from 'vitest';
import { isLodging, nights, normalizeType, sameCity } from './activityTypes';

describe('tipos de atividade', () => {
  it('normaliza os tipos do backend e variações antigas', () => {
    expect(normalizeType('Passeio')).toBe('Passeio');
    expect(normalizeType('gastronomia')).toBe('Gastronomia');
    expect(normalizeType('Comida')).toBe('Gastronomia');
    expect(normalizeType('Hotel')).toBe('Hospedagem');
    expect(normalizeType('Ônibus')).toBe('Transporte');
    expect(normalizeType('qualquer')).toBeNull();
    expect(normalizeType(null)).toBeNull();
  });

  it('hospedagem é uma atividade do tipo Hospedagem', () => {
    expect(isLodging('Hospedagem')).toBe(true);
    expect(isLodging('Pousada')).toBe(true);
    expect(isLodging('Passeio')).toBe(false);
  });

  it('compara cidades sem acento e sem caixa', () => {
    expect(sameCity('Tóquio', 'toquio')).toBe(true);
    expect(sameCity('Rio de Janeiro', 'Paris')).toBe(false);
    expect(sameCity(null, 'Paris')).toBe(false);
  });

  it('converte duracaoMinutos em noites', () => {
    expect(nights(3 * 1440)).toBe(3);
    expect(nights(600)).toBe(1);
    expect(nights(null)).toBeNull();
  });
});
