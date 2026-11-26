import { useState } from 'react';
import { ArrowsLeftRight, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, CurrencyCircleDollar, Sun, Thermometer, type Icon } from '@phosphor-icons/react';
import { currencyOf, useGeocode, useRatesFromBRL, useWeather, type Weather } from '../lib/travelInfo';
import { toAlpha3 } from '../lib/countries';
import { parseDate } from '../lib/format';
import { Alert, Skeleton } from './ui';

/** Códigos de tempo da OMM (usados pelo Open-Meteo) em ícone e texto. */
function weatherMeta(code: number): { label: string; icon: Icon } {
  if (code === 0) return { label: 'Céu limpo', icon: Sun };
  if (code <= 2) return { label: 'Poucas nuvens', icon: CloudSun };
  if (code === 3) return { label: 'Nublado', icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Neblina', icon: CloudFog };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Chuva', icon: CloudRain };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: 'Neve', icon: CloudSnow };
  if (code >= 95) return { label: 'Tempestade', icon: CloudLightning };
  return { label: 'Nublado', icon: Cloud };
}

const t = (n: number) => `${Math.round(n)}°`;
const dayLabel = (iso: string) => parseDate(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }).replace('.', '');

const MODE_TEXT: Record<Weather['mode'], (w: Weather) => string> = {
  forecast: () => 'Previsão do tempo',
  typical: (w) => `Clima típico: como foi nas mesmas datas em ${w.refYear} (a previsão só cobre os próximos 16 dias)`,
  past: () => 'Como foi o tempo nesses dias',
};

/** Tempo no destino: um cartãozinho por dia (ícone, máxima/mínima e chuva). */
export function WeatherStrip({ city, countryA3, countryName, start, end }: { city: string; countryA3?: string | null; countryName?: string | null; start?: string | null; end?: string | null }) {
  const a3 = toAlpha3(countryA3, countryName);
  const geo = useGeocode(city, a3);
  const weather = useWeather(geo.data, start, end);
  if (geo.isLoading || weather.isLoading) return <Skeleton style={{ height: 112 }} />;
  if (geo.error || weather.error) return <Alert kind="warning">Não consegui buscar o clima agora. Tente de novo mais tarde.</Alert>;
  if (!geo.data) return <p className="type-body-sm muted">Não encontrei “{city}” no serviço de clima.</p>;
  const w = weather.data;
  if (!w || w.days.length === 0) return <p className="type-body-sm muted">Sem dados de clima para essas datas.</p>;
  return (
    <div className="stack-sm">
      <p className="type-body-sm muted">{MODE_TEXT[w.mode](w)}</p>
      <ul className="weather-strip">
        {w.days.map((d) => {
          const m = weatherMeta(d.code);
          return (
            <li key={d.date} className="weather-day" title={m.label}>
              <span className="type-label-sm muted">{dayLabel(d.date)}</span>
              <m.icon size={28} weight="duotone" aria-hidden />
              <span className="sr-only">{m.label}</span>
              <span className="type-numeric-md">{t(d.max)} <span className="muted">{t(d.min)}</span></span>
              {d.rain != null && (
                <span className="type-body-sm muted">{w.mode === 'forecast' ? `${Math.round(d.rain)}% chuva` : `${d.rain.toFixed(1).replace('.', ',')} mm`}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const fmt = (v: number, currency: string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: v < 10 ? 2 : 2 }).format(v);

/** Conversor real ↔ moeda local, com a cotação do dia. */
export function CurrencyConverter({ countryA3, countryName }: { countryA3?: string | null; countryName?: string | null }) {
  const code = currencyOf(countryA3, countryName);
  const rates = useRatesFromBRL();
  const [brl, setBrl] = useState('100');
  const [local, setLocal] = useState<string | null>(null);

  if (!code) return <p className="type-body-sm muted">Não sei a moeda deste país.</p>;
  if (code === 'BRL') return <p className="type-body-md inline-link"><CurrencyCircleDollar size={20} aria-hidden /> A moeda local é o real: sem conversão.</p>;
  if (rates.isLoading) return <Skeleton style={{ height: 96 }} />;
  const rate = rates.data?.rates[code];
  if (rates.error || !rate) return <Alert kind="warning">Cotação indisponível agora. Tente de novo mais tarde.</Alert>;

  const brlValue = local != null ? Number(local.replace(',', '.')) / rate : Number(brl.replace(',', '.'));
  const localValue = local != null ? Number(local.replace(',', '.')) : Number(brl.replace(',', '.')) * rate;
  const name = new Intl.DisplayNames(['pt-BR'], { type: 'currency' }).of(code) ?? code;
  return (
    <div className="stack-sm">
      <div className="currency-row">
        <div className="field">
          <label htmlFor={`brl-${code}`} className="type-label-md">Real (BRL)</label>
          <input id={`brl-${code}`} className="input" inputMode="decimal" value={local != null ? (Number.isFinite(brlValue) ? brlValue.toFixed(2).replace('.', ',') : '') : brl}
            onChange={(e) => { setLocal(null); setBrl(e.target.value); }} />
        </div>
        <ArrowsLeftRight size={20} aria-hidden className="currency-swap" />
        <div className="field">
          <label htmlFor={`loc-${code}`} className="type-label-md">{name} ({code})</label>
          <input id={`loc-${code}`} className="input" inputMode="decimal" value={local ?? (Number.isFinite(localValue) ? localValue.toFixed(2).replace('.', ',') : '')}
            onChange={(e) => setLocal(e.target.value)} />
        </div>
      </div>
      <p className="type-body-sm muted">
        {fmt(1, 'BRL')} = {fmt(rate, code)} · {fmt(1, code)} = {fmt(1 / rate, 'BRL')} · cotação de {rates.data!.updatedAt.toLocaleDateString('pt-BR')}, só para referência.
      </p>
    </div>
  );
}

/** Cartão de clima + câmbio de um destino (usado na página do destino e na aba da viagem). */
export function TravelInfoCard({ title, city, countryA3, countryName, start, end }: { title: string; city: string; countryA3?: string | null; countryName?: string | null; start?: string | null; end?: string | null }) {
  return (
    <section className="card stack" aria-label={title}>
      <h3 className="type-headline-sm card-title">{title}</h3>
      <div className="stack-sm">
        <h4 className="type-label-sm muted inline-link"><Thermometer size={16} aria-hidden /> Clima</h4>
        <WeatherStrip city={city} countryA3={countryA3} countryName={countryName} start={start} end={end} />
      </div>
      <div className="stack-sm">
        <h4 className="type-label-sm muted inline-link"><CurrencyCircleDollar size={16} aria-hidden /> Câmbio</h4>
        <CurrencyConverter countryA3={countryA3} countryName={countryName} />
      </div>
    </section>
  );
}
