import { describe, expect, it } from 'vitest';
import { alpha3ToNumeric, countryNamePt, toAlpha3 } from './countries';

describe('países', () => {
  it('aceita alfa-3, alfa-2 ou o nome em português', () => {
    expect(toAlpha3('FRA')).toBe('FRA');
    expect(toAlpha3('br')).toBe('BRA');
    expect(toAlpha3(null, 'Japão')).toBe('JPN');
    expect(toAlpha3(null, 'Reino Unido')).toBe('GBR');
    expect(toAlpha3('XYZ', 'Lugar Nenhum')).toBeNull();
  });

  it('converte para o código numérico do mapa e dá o nome em português', () => {
    expect(alpha3ToNumeric('BRA')).toBe('076');
    expect(countryNamePt('ARG')).toBe('Argentina');
  });
});
