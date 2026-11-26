const brl = (currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency });
export const money = (v: number | null | undefined, currency = 'BRL') => brl(currency).format(v ?? 0);
/** Preço de catálogo: zero quer dizer entrada gratuita. */
export const price = (v: number | null | undefined) => (v == null ? null : v === 0 ? 'Grátis' : money(v));
export const percent = (v: number) => `${Math.round(v)} %`;
export const rating = (v: number | null | undefined) => (v == null ? '–' : v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

/** Datas da API chegam como "2027-03-12" (sem fuso): montar no horário local evita o dia deslocado. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}
export const dateShort = (iso: string) => parseDate(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
export const dateLong = (iso: string) => parseDate(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
export const dateRange = (a: string | null, b: string | null) => (a && b ? `${dateShort(a)} – ${dateLong(b)}` : a ? `a partir de ${dateLong(a)}` : 'Datas a definir');
export const dayHeading = (iso: string) => parseDate(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
export const timeOf = (isoDateTime: string | null) => (isoDateTime ? isoDateTime.slice(11, 16) : '');

export function daysUntil(iso: string, today = new Date()): number {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((parseDate(iso).getTime() - t) / 86_400_000);
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

/** Duração em minutos para texto: 90 -> "1 h 30 min", 120 -> "2 h", 45 -> "45 min". */
export function duration(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
}

/** Horário de término: "09:00" + 150 min -> "11:30" (passa da meia-noite com o dia seguinte implícito). */
export function endTime(start: string, min: number | null | undefined): string | null {
  if (!start || !min) return null;
  const [h, m] = start.split(':').map(Number);
  const total = (h! * 60 + m! + min) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
