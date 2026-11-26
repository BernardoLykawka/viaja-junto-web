import { describe, expect, it } from 'vitest';
import { matchPlace, placeLabel } from './places';
import type { Place } from './types';

const place = (id: number, name: string, city: string | null, country: string): Place => ({
  id, name, city, country, isoCode: null, description: null, category: null, photoUrl: null, averageRating: null, reviewCount: 0,
});
const places = [place(2, 'Rio de Janeiro', 'Rio de Janeiro', 'Brasil'), place(4, 'Bariloche', 'San Carlos de Bariloche', 'Argentina')];

describe('matchPlace', () => {
  it('acha pela sugestão escolhida, pelo nome ou pela cidade', () => {
    expect(matchPlace(places, placeLabel(places[0]!))?.id).toBe(2);
    expect(matchPlace(places, 'rio de janeiro')?.id).toBe(2);
    expect(matchPlace(places, 'San Carlos de Bariloche')?.id).toBe(4);
  });

  it('não acha texto livre que não está no catálogo', () => {
    expect(matchPlace(places, 'Lisboa')).toBeNull();
    expect(matchPlace(places, '  ')).toBeNull();
  });
});
