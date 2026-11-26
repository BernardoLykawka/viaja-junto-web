import countries from 'i18n-iso-countries';
import pt from 'i18n-iso-countries/langs/pt.json';

countries.registerLocale(pt);

/** ISO 3166 alfa-3 ("BRA") a partir do código que a API manda (alfa-3 ou alfa-2) ou do nome do país em português. */
export function toAlpha3(code: string | null | undefined, countryName?: string | null): string | null {
  const c = code?.trim().toUpperCase();
  if (c?.length === 3 && countries.isValid(c)) return c;
  if (c?.length === 2 && countries.isValid(c)) return countries.alpha2ToAlpha3(c) ?? null;
  if (countryName) return countries.getAlpha3Code(countryName.trim(), 'pt') ?? null;
  return null;
}

/** O mapa (world-atlas) identifica países pelo código numérico ("076" = Brasil). */
export const alpha3ToNumeric = (a3: string) => countries.alpha3ToNumeric(a3) ?? null;
export const numericToAlpha3 = (n: string | number) => countries.numericToAlpha3(String(n).padStart(3, '0')) ?? null;
export const countryNamePt = (a3: string) => countries.getName(a3, 'pt') ?? a3;
