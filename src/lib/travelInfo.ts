import { useQuery } from '@tanstack/react-query';
import countryToCurrency from 'country-to-currency';
import countries from 'i18n-iso-countries';
import { toAlpha3 } from './countries';

/**
 * Clima e câmbio no destino, com serviços públicos gratuitos que não pedem chave (chamados direto do
 * navegador; a API do ViajaJunto não participa):
 * - Open-Meteo: localização da cidade, previsão (até 16 dias) e histórico do clima;
 * - ExchangeRate-API (open.er-api.com): cotações a partir do real, atualizadas uma vez por dia.
 * Só o nome da cidade e as datas saem do navegador; nada do usuário.
 */

export interface GeoPlace {
  name: string;
  lat: number;
  lon: number;
  countryCode: string | null; // ISO alfa-2
}

const json = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
};

/** Coordenadas da cidade (Open-Meteo Geocoding). Prefere o resultado do país certo quando ele é conhecido. */
export function useGeocode(name: string | null | undefined, countryA3?: string | null) {
  const a2 = countryA3 ? countries.alpha3ToAlpha2(countryA3) ?? null : null;
  return useQuery({
    queryKey: ['geo', name, a2],
    enabled: !!name,
    staleTime: Infinity,
    queryFn: async (): Promise<GeoPlace | null> => {
      const url = `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: name!, count: '5', language: 'pt', format: 'json' })}`;
      const data = await json<{ results?: { name: string; latitude: number; longitude: number; country_code?: string }[] }>(url);
      const list = data.results ?? [];
      const best = (a2 && list.find((r) => r.country_code === a2)) || list[0];
      return best ? { name: best.name, lat: best.latitude, lon: best.longitude, countryCode: best.country_code ?? a2 } : null;
    },
  });
}

export interface WeatherDay {
  date: string;
  code: number;
  max: number;
  min: number;
  /** Chance de chuva em % (previsão) ou milímetros de chuva no dia (histórico). */
  rain: number | null;
}

export interface Weather {
  /** forecast = previsão; typical = mesmas datas de um ano anterior (para datas distantes); past = o que fez. */
  mode: 'forecast' | 'typical' | 'past';
  refYear?: number;
  days: WeatherDay[];
}

const ISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y!, m! - 1, d!); };
const MAX_DAYS = 14;
const FORECAST_DAYS = 16;

/**
 * Decide de onde vem o clima das datas pedidas: previsão quando cabem nos próximos 16 dias, histórico real
 * quando já passaram e, para datas mais distantes, o clima das mesmas datas no ano anterior ("clima típico").
 * Sem datas, mostra a previsão dos próximos 7 dias. No máximo 14 dias.
 */
export function weatherPlan(start: string | null | undefined, end: string | null | undefined, today = new Date()): { mode: Weather['mode']; from: string; to: string; refYear?: number } {
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!start) return { mode: 'forecast', from: ISO(t0), to: ISO(addDays(t0, 6)) };
  let from = parse(start);
  let to = end ? parse(end) : from;
  if (to < from) to = from;
  if (+to - +from > (MAX_DAYS - 1) * 86_400_000) to = addDays(from, MAX_DAYS - 1);
  const lastForecast = addDays(t0, FORECAST_DAYS - 1);
  if (to < addDays(t0, -5)) return { mode: 'past', from: ISO(from), to: ISO(to) };
  if (from <= lastForecast && to >= t0) {
    if (from < t0) from = t0;
    if (to > lastForecast) to = lastForecast;
    return { mode: 'forecast', from: ISO(from), to: ISO(to) };
  }
  // Datas distantes: mesmas datas, recuando ano a ano até ficar no passado.
  let years = 0;
  while (addDays(new Date(to.getFullYear() - years, to.getMonth(), to.getDate()), 0) >= addDays(t0, -5)) years += 1;
  const shift = (d: Date) => new Date(d.getFullYear() - years, d.getMonth(), d.getDate());
  return { mode: 'typical', from: ISO(shift(from)), to: ISO(shift(to)), refYear: from.getFullYear() - years };
}

export function useWeather(geo: GeoPlace | null | undefined, start?: string | null, end?: string | null) {
  const plan = weatherPlan(start, end);
  return useQuery({
    queryKey: ['weather', geo?.lat, geo?.lon, plan.mode, plan.from, plan.to],
    enabled: !!geo,
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<Weather> => {
      const forecast = plan.mode === 'forecast';
      const base = forecast ? 'https://api.open-meteo.com/v1/forecast' : 'https://archive-api.open-meteo.com/v1/archive';
      const daily = `weather_code,temperature_2m_max,temperature_2m_min,${forecast ? 'precipitation_probability_max' : 'precipitation_sum'}`;
      const url = `${base}?${new URLSearchParams({ latitude: String(geo!.lat), longitude: String(geo!.lon), daily, timezone: 'auto', start_date: plan.from, end_date: plan.to })}`;
      const d = await json<{ daily?: Record<string, (number | string | null)[]> }>(url);
      const time = (d.daily?.time ?? []) as string[];
      const rain = (forecast ? d.daily?.precipitation_probability_max : d.daily?.precipitation_sum) ?? [];
      return {
        mode: plan.mode,
        refYear: plan.refYear,
        days: time.map((date, i) => ({
          date,
          code: Number(d.daily?.weather_code?.[i] ?? 0),
          max: Number(d.daily?.temperature_2m_max?.[i] ?? NaN),
          min: Number(d.daily?.temperature_2m_min?.[i] ?? NaN),
          rain: rain[i] == null ? null : Number(rain[i]),
        })).filter((x) => Number.isFinite(x.max)),
      };
    },
  });
}

/** Moeda local de um país (código ISO 4217), pelo código do país ou pelo nome em português. */
export function currencyOf(isoCode: string | null | undefined, countryName?: string | null): string | null {
  const a3 = toAlpha3(isoCode, countryName);
  const a2 = a3 ? countries.alpha3ToAlpha2(a3) : null;
  return a2 ? ((countryToCurrency as Record<string, string>)[a2] ?? null) : null;
}

/** Cotações a partir do real (1 BRL = x moeda). */
export function useRatesFromBRL() {
  return useQuery({
    queryKey: ['rates', 'BRL'],
    staleTime: 6 * 60 * 60_000,
    queryFn: async () => {
      const d = await json<{ result: string; rates: Record<string, number>; time_last_update_unix: number }>('https://open.er-api.com/v6/latest/BRL');
      if (d.result !== 'success') throw new Error('cotação indisponível');
      return { rates: d.rates, updatedAt: new Date(d.time_last_update_unix * 1000) };
    },
  });
}
