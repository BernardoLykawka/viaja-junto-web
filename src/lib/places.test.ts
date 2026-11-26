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

import { sizedPhoto } from '../components/FadeImg';

describe('sizedPhoto', () => {
  it('pede ao Unsplash uma versão menor e deixa outras origens como estão', () => {
    const u = new URL(sizedPhoto('https://images.unsplash.com/photo-123', 800)!);
    expect(u.searchParams.get('w')).toBe('800');
    expect(u.searchParams.get('auto')).toBe('format');
    expect(sizedPhoto('https://upload.wikimedia.org/x/960px-a.jpg')).toBe('https://upload.wikimedia.org/x/960px-a.jpg');
    expect(sizedPhoto('https://images.unsplash.com/photo-1?w=300')).toBe('https://images.unsplash.com/photo-1?w=300');
  });
});

import { duration, endTime } from './format';

describe('duração da atividade', () => {
  it('formata minutos e calcula o término', () => {
    expect(duration(90)).toBe('1 h 30 min');
    expect(duration(120)).toBe('2 h');
    expect(duration(45)).toBe('45 min');
    expect(duration(null)).toBeNull();
    expect(endTime('09:00', 150)).toBe('11:30');
    expect(endTime('23:30', 90)).toBe('01:00');
  });
});
