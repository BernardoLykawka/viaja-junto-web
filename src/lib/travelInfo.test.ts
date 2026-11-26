import { describe, expect, it } from 'vitest';
import { currencyOf, weatherPlan } from './travelInfo';

const today = new Date(2026, 10, 26); // 26 nov. 2026

describe('weatherPlan', () => {
  it('sem datas: previsão dos próximos 7 dias', () => {
    expect(weatherPlan(null, null, today)).toEqual({ mode: 'forecast', from: '2026-11-26', to: '2026-12-02' });
  });

  it('datas nos próximos 16 dias: previsão, cortada no último dia previsto', () => {
    expect(weatherPlan('2026-12-05', '2026-12-20', today)).toEqual({ mode: 'forecast', from: '2026-12-05', to: '2026-12-11' });
  });

  it('datas distantes: clima típico das mesmas datas no ano anterior', () => {
    expect(weatherPlan('2027-03-12', '2027-03-15', today)).toEqual({ mode: 'typical', from: '2026-03-12', to: '2026-03-15', refYear: 2026 });
  });

  it('viagem que já passou: o clima que fez, no máximo 14 dias', () => {
    expect(weatherPlan('2026-01-01', '2026-02-01', today)).toEqual({ mode: 'past', from: '2026-01-01', to: '2026-01-14' });
  });
});

describe('currencyOf', () => {
  it('acha a moeda pelo código do país ou pelo nome', () => {
    expect(currencyOf('FRA')).toBe('EUR');
    expect(currencyOf(null, 'Japão')).toBe('JPY');
    expect(currencyOf('BRA')).toBe('BRL');
    expect(currencyOf(null, 'Lugar nenhum')).toBeNull();
  });
});
