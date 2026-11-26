import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Envelope } from '@phosphor-icons/react';
import { evaluateBadges, TIER_LABEL, TIERS, travelStats, unitLabel, type BadgeProgress } from '../../lib/badges';
import { useMe, useMyReviewCount, usePlaces } from '../../lib/queries';
import { useTravelHistory, type TravelHistory } from '../../lib/travelHistory';
import { Dialog } from '../ui';
import { BadgeStamp } from './BadgeStamp';

/** Selos do usuário logado, já avaliados. */
export function useBadges(): { loading: boolean; badges: BadgeProgress[]; history: TravelHistory } {
  const history = useTravelHistory();
  const places = usePlaces('');
  const me = useMe();
  const reviews = useMyReviewCount(me.data?.id);
  const badges = useMemo(
    () => evaluateBadges(travelStats(history, places.data?.data ?? [], me.data?.id, reviews.count)),
    [history, places.data, me.data?.id, reviews.count],
  );
  return { loading: history.loading || places.isLoading, badges, history };
}

function TierPill({ b }: { b: BadgeProgress }) {
  if (!b.tier) return <span className="selo-pill selo-locked type-label-sm">Bloqueado</span>;
  return <span className={`selo-pill selo-${b.tier} type-label-sm`}><i className={`tier-dot tier-${b.tier}`} aria-hidden /> {TIER_LABEL[b.tier]}</span>;
}

function ProgressLine({ b }: { b: BadgeProgress }) {
  if (!b.next) return <p className="type-body-sm muted">Nível máximo!</p>;
  return (
    <div className="stack-sm" style={{ gap: 'var(--spacing-xs)', width: '100%' }}>
      <div className="progress-track" role="progressbar" aria-label={`Progresso até ${TIER_LABEL[b.next.tier]}`} aria-valuemin={0} aria-valuemax={b.next.target} aria-valuenow={b.value}>
        <div className="progress-fill" style={{ width: `${Math.round(b.progress * 100)}%` }} />
      </div>
      <p className="type-body-sm muted">{b.value} de {unitLabel(b.def, b.next.target)} para {TIER_LABEL[b.next.tier]}</p>
    </div>
  );
}

/** Card de um selo: o selo postal, nome, nível e progresso. Clicar abre os quatro níveis. */
export function BadgeCard({ b, history, compact, onOpen }: { b: BadgeProgress; history: TravelHistory; compact?: boolean; onOpen: () => void }) {
  return (
    <button type="button" className={`selo-card ${compact ? 'compact' : ''} ${b.tier ? '' : 'is-locked'}`} onClick={onOpen} aria-label={`${b.def.name}: ${b.tier ? TIER_LABEL[b.tier] : 'bloqueado'}. Ver níveis`}>
      <BadgeStamp art={b.def.art} tier={b.tier} size={compact ? 64 : 92} visitedCountries={history.visitedCountries} />
      <span className="type-title-md selo-name">{b.def.name}</span>
      <TierPill b={b} />
      {!compact && <ProgressLine b={b} />}
    </button>
  );
}

export function BadgeDialog({ b, history, onClose }: { b: BadgeProgress | null; history: TravelHistory; onClose: () => void }) {
  return (
    <Dialog open={!!b} onClose={onClose} title={b?.def.name ?? 'Selo'}>
      {b && (
        <div className="stack">
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
            <BadgeStamp art={b.def.art} tier={b.tier} size={112} visitedCountries={history.visitedCountries} />
            <div className="stack-sm" style={{ flex: 1, minWidth: 200 }}>
              <p className="type-body-md">{b.def.description}</p>
              <TierPill b={b} />
              <ProgressLine b={b} />
            </div>
          </div>
          <ol className="tier-list">
            {TIERS.map((t, i) => {
              const target = b.def.thresholds[i]!;
              const done = b.value >= target;
              return (
                <li key={t} className={done ? 'done' : ''}>
                  <BadgeStamp art={b.def.art} tier={done ? t : null} size={36} visitedCountries={history.visitedCountries} />
                  <div className="grow">
                    <p className="type-title-md">{TIER_LABEL[t]}</p>
                    <p className="type-body-sm muted">{unitLabel(b.def, target)}</p>
                  </div>
                  {done ? <CheckCircle size={24} weight="fill" aria-label="Conquistado" style={{ color: 'var(--color-primary)' }} /> : <span className="type-body-sm muted">faltam {target - b.value}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </Dialog>
  );
}

/** Inclinação de cada selo colado no álbum (fixa por posição, para não mudar a cada render). */
const TILT = [-5, 3, -2, 6, -4, 2, 5, -3, 1, -6, 4, -1];
const SLOTS_PER_PAGE = 6;

/**
 * Prévia do Início: um álbum de selos aberto. Os selos conquistados aparecem "colados" com fita
 * adesiva e levemente tortas; o resto do álbum mostra os espaços vazios esperando a próxima conquista.
 */
export function BadgeAlbum() {
  const data = useBadges();
  return <AlbumView {...data} />;
}

/** Duração da virada de folha. */
const TURN_MS = 900;

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || window.matchMedia?.('(max-width: 639px)').matches);

type PageProps = { page: BadgeProgress[]; number: number; side: 'left' | 'right'; history: TravelHistory; onOpen?: (b: BadgeProgress) => void };

/** Uma página do álbum: 6 lugares, cada selo colado ou o espaço vazio com o nome dele. */
function AlbumPage({ page, number, side, history, onOpen }: PageProps) {
  return (
    <div className={`album-page ${side}`}>
      <ul className="album-grid">
        {page.map((b, i) => (
          <li key={b.def.id} className="album-slot">
            {b.tier ? (
              <button type="button" className="sticker" style={{ ['--tilt' as string]: `${TILT[(number * 6 + i) % TILT.length]}deg` }} onClick={() => onOpen?.(b)} aria-label={`${b.def.name}: ${TIER_LABEL[b.tier]}. Ver níveis`}>
                <BadgeStamp art={b.def.art} tier={b.tier} size={72} visitedCountries={history.visitedCountries} />
                <span className="type-label-md sticker-name">{b.def.name}</span>
              </button>
            ) : (
              <button type="button" className="slot-empty" onClick={() => onOpen?.(b)} aria-label={`Espaço vazio: ${b.def.name}. Ver como conquistar`}>
                <span className="slot-circle" aria-hidden>?</span>
                <span className="type-body-sm muted">{b.def.name}</span>
              </button>
            )}
          </li>
        ))}
        {/* Lugares que sobram na última página: mantêm o álbum do mesmo tamanho em todas as folhas. */}
        {Array.from({ length: Math.max(0, SLOTS_PER_PAGE - page.length) }, (_, i) => <li key={`sobra-${i}`} className="album-slot" aria-hidden />)}
      </ul>
      {number > 0 && <span className="album-page-number type-label-sm" aria-hidden>{number}</span>}
    </div>
  );
}

/** Em quantas tiras a folha é cortada para poder se curvar. */
const STRIPS = 10;

/**
 * A folha que vira, cortada em tiras verticais encaixadas uma na outra. A primeira gira na lombada; cada tira
 * seguinte gira mais um pouco em relação à anterior, e esse "mais um pouco" muda durante a virada. A soma
 * dessas pequenas dobras faz o papel se curvar como uma onda: a ponta sobe na frente, depois fica para trás
 * e assenta reta do outro lado. Cada tira mostra a sua fatia da página (frente) e do verso.
 */
function Leaf({ dir, front, back }: { dir: 'next' | 'prev'; front: React.ReactNode; back: React.ReactNode }) {
  // Fatia de cada lado: no avanço a tira 0 está na lombada (esquerda da página da frente); ao voltar, na direita.
  const frontSlice = (i: number) => (dir === 'next' ? i : STRIPS - 1 - i);
  const backSlice = (i: number) => (dir === 'next' ? STRIPS - 1 - i : i);
  const strip = (i: number): React.ReactNode => (
    <div className={`leaf-strip ${i === 0 ? 'root' : 'child'}`} style={{ ['--i' as string]: i }}>
      {/* A face (3D) não recorta sozinha de forma confiável; quem recorta é a caixa 2D de dentro (strip-clip). */}
      <div className="strip-face front">
        <div className="strip-clip">
          <div className="strip-content" style={{ left: `${(-frontSlice(i) * 100)}%` }}>{front}</div>
        </div>
      </div>
      <div className="strip-face back">
        <div className="strip-clip">
          <div className="strip-content" style={{ left: `${(-backSlice(i) * 100)}%` }}>{back}</div>
        </div>
      </div>
      {i < STRIPS - 1 && strip(i + 1)}
    </div>
  );
  return (
    <div className={`album-leaf ${dir}`} style={{ ['--n' as string]: STRIPS }} aria-hidden inert>
      {strip(0)}
    </div>
  );
}

/**
 * O álbum em si, sem buscar dados (usado no Início e no Perfil). Todos os selos têm um lugar: os conquistados
 * aparecem colados, os outros como espaço vazio com o nome do selo.
 *
 * Para virar a página, clica-se no canto dobrado (embaixo à direita avança, embaixo à esquerda volta). A folha
 * (ver Leaf) gira na lombada se curvando; por baixo, já está a página seguinte. Uma sombra acompanha o giro.
 */
export function AlbumView({ loading, badges, history }: { loading: boolean; badges: BadgeProgress[]; history: TravelHistory }) {
  const [open, setOpen] = useState<BadgeProgress | null>(null);
  const [spread, setSpread] = useState(0);
  const [turning, setTurning] = useState<null | 'next' | 'prev'>(null);
  // Depois da primeira virada, os selos não repetem a animação de "colar" (ver CSS .has-turned).
  const [hasTurned, setHasTurned] = useState(false);
  const earned = badges.filter((b) => b.tier).length;

  // Uma página tem 6 lugares; duas páginas formam a folha aberta.
  const pages: BadgeProgress[][] = [];
  for (let i = 0; i < badges.length; i += SLOTS_PER_PAGE) pages.push(badges.slice(i, i + SLOTS_PER_PAGE));
  if (pages.length === 0) pages.push([]);
  const spreads = Math.ceil(pages.length / 2);
  const pageAt = (n: number) => pages[n] ?? [];
  const L = spread * 2;

  function turn(dir: 'next' | 'prev') {
    const target = spread + (dir === 'next' ? 1 : -1);
    if (turning || target < 0 || target >= spreads) return;
    setHasTurned(true);
    if (reduceMotion()) return setSpread(target);
    setTurning(dir);
    window.setTimeout(() => {
      setSpread(target);
      setTurning(null);
    }, TURN_MS);
  }

  // Durante a virada, por baixo da folha já aparece o que vai ficar à mostra no fim.
  const baseLeft = turning === 'prev' ? L - 2 : L;
  const baseRight = turning === 'next' ? L + 3 : L + 1;
  const page = (n: number, side: 'left' | 'right', interactive = true) => (
    <AlbumPage page={pageAt(n)} number={pages[n] ? n + 1 : 0} side={side} history={history} onOpen={interactive ? setOpen : undefined} />
  );

  return (
    <section className="band-full" aria-labelledby="album-h">
      <div className="section-row">
        <h2 id="album-h" className="type-headline-sm card-title inline-link"><Envelope size={24} weight="duotone" aria-hidden /> Meu álbum de selos</h2>
        <span className="type-label-sm muted">{loading ? 'Carregando…' : `${earned} de ${badges.length} colados · páginas ${L + 1}–${Math.min(L + 2, pages.length)} de ${pages.length}`}</span>
      </div>
      <div className={`album ${turning ? `is-turning turn-${turning}` : ''} ${hasTurned ? 'has-turned' : ''}`} aria-busy={loading} style={{ ['--turn' as string]: `${TURN_MS}ms` }}>
        {page(baseLeft, 'left', !turning)}
        {page(baseRight, 'right', !turning)}

        {turning && (
          /* A folha que vira: frente = página atual, verso = a que aparece do outro lado. */
          <Leaf dir={turning} front={turning === 'next' ? page(L + 1, 'right', false) : page(L, 'left', false)} back={turning === 'next' ? page(L + 2, 'left', false) : page(L - 1, 'right', false)} />
        )}

        {!turning && spread > 0 && (
          <button type="button" className="page-corner prev" onClick={() => turn('prev')} aria-label="Voltar a página do álbum">
            <svg viewBox="0 0 48 48" aria-hidden><polygon className="corner-gap" points="0,0 0,48 48,48" /><polygon className="corner-flap" points="0,0 48,48 48,0" /></svg>
          </button>
        )}
        {!turning && spread < spreads - 1 && (
          <button type="button" className="page-corner next" onClick={() => turn('next')} aria-label="Passar a página do álbum">
            <svg viewBox="0 0 48 48" aria-hidden><polygon className="corner-gap" points="48,0 48,48 0,48" /><polygon className="corner-flap" points="48,0 0,48 0,0" /></svg>
          </button>
        )}
      </div>
      <BadgeDialog b={open} history={history} onClose={() => setOpen(null)} />
    </section>
  );
}

/** Perfil: o mesmo álbum do Início, com todas as páginas. "Abrir álbum" do Início chega aqui com #selos. */
export function BadgesSection() {
  const data = useBadges();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#selos' && !data.loading) document.getElementById('selos')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, data.loading]);
  return (
    <div id="selos" style={{ scrollMarginTop: 'var(--spacing-5xl)' }}>
      <AlbumView {...data} />
    </div>
  );
}
