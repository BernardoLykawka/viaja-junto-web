import { useRef, useState, type KeyboardEvent } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarBlank, Check, CloudSun, LinkSimple, MapPin, PencilSimple, Receipt, Trash, UsersThree, Wallet, MapTrifold } from '@phosphor-icons/react';
import { errorMessage, ApiError } from '../lib/api';
import { dateRange } from '../lib/format';
import { useMe, useTrip, useTripMutations } from '../lib/queries';
import { Alert, AvatarStack, Button, EmptyState, Skeleton, StatusBadge } from '../components/ui';
import { Roteiro } from '../components/Roteiro';
import { OrcamentoTab } from '../components/OrcamentoTab';
import { MembrosTab, ROLE_META } from '../components/MembrosTab';
import { EditarViagemDialog } from '../components/EditarViagemDialog';
import { MapaTab } from '../components/MapaTab';
import { ClimaTab } from '../components/ClimaTab';
import { inviteLink } from '../lib/invite';
import { tripPeople } from '../lib/members';

const TABS = [
  { id: 'roteiro', label: 'Roteiro', icon: MapTrifold },
  { id: 'mapa', label: 'Mapa', icon: MapPin },
  { id: 'clima', label: 'Clima e câmbio', icon: CloudSun },
  { id: 'orcamento', label: 'Orçamento', icon: Wallet },
  { id: 'despesas', label: 'Despesas', icon: Receipt },
  { id: 'membros', label: 'Membros', icon: UsersThree },
] as const;
type TabId = (typeof TABS)[number]['id'];

export function Viagem() {
  const { id } = useParams();
  const tripId = Number(id);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const me = useMe();
  const { data: trip, isLoading, error } = useTrip(tripId);
  const mut = useTripMutations(tripId);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (!Number.isFinite(tripId)) return <Navigate to="/viagens" replace />;

  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'roteiro') as TabId;
  const select = (t: TabId) => setParams(t === 'roteiro' ? {} : { aba: t }, { replace: true });

  function onTabKey(e: KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (next == null) return;
    e.preventDefault();
    const target = TABS[(next + TABS.length) % TABS.length]!.id;
    select(target);
    tabRefs.current[target]?.focus();
  }

  if (isLoading) return <div className="container page-work"><Skeleton style={{ height: 180, borderRadius: 'var(--radius-xl)' }} /></div>;
  if (error || !trip) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 403);
    return (
      <div className="container page-work">
        <Link to="/viagens" className="back type-label-md"><ArrowLeft size={20} aria-hidden /> Minhas viagens</Link>
        <Alert kind="error">{notFound ? 'Viagem não encontrada. Ela pode ter sido removida ou você não faz parte dela.' : errorMessage(error)}</Alert>
      </div>
    );
  }

  const canEdit = trip.myRole === 'OWNER' || trip.myRole === 'EDITOR';
  const RoleIcon = ROLE_META[trip.myRole].icon;

  async function copyCode() {
    if (!trip?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteLink(trip.id, trip.inviteCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem permissão de área de transferência: o código continua visível na tela */
    }
  }

  return (
    <div className="container page-work" data-can-edit={canEdit}>
      <Link to="/viagens" className="back type-label-md"><ArrowLeft size={20} aria-hidden /> Minhas viagens</Link>

      <header className="hero-banner">
        <div>
          <StatusBadge status={trip.status} />
          <h1 className="type-display" style={{ marginTop: 'var(--spacing-sm-plus)' }}>{trip.name}</h1>
          <div className="hero-meta type-body-sm">
            <span><CalendarBlank size={16} aria-hidden /> {dateRange(trip.startDate, trip.endDate)}</span>
            <span><RoleIcon size={16} aria-hidden /> Você é {ROLE_META[trip.myRole].label.toLowerCase()}</span>
          </div>
          {trip.description && <p className="type-body-md" style={{ marginTop: 'var(--spacing-sm-plus)', color: 'var(--color-neutral)' }}>{trip.description}</p>}
        </div>
        <div className="hero-side">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm-plus)' }}>
            <AvatarStack people={tripPeople(trip).map((m) => m.user)} />
            {canEdit && (
              <button type="button" className="button-pill button-pill-light type-label-md" onClick={() => setEditing(true)}>
                <PencilSimple size={20} aria-hidden /> Editar
              </button>
            )}
          </div>
          {trip.myRole === 'OWNER' && trip.inviteCode && (
            <div className="code-box">
              <div><span className="type-label-sm" style={{ display: 'block' }}>Código de convite</span><span className="code">{trip.inviteCode}</span></div>
              <button type="button" className="icon-button" aria-label={copied ? 'Link de convite copiado' : 'Copiar link de convite'} title="Copiar link de convite" onClick={copyCode} style={{ color: 'var(--color-on-primary)' }}>
                {copied ? <Check size={20} aria-hidden /> : <LinkSimple size={20} aria-hidden />}
              </button>
              <span className="sr-only" role="status">{copied ? 'Link de convite copiado' : ''}</span>
            </div>
          )}
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Seções da viagem" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button key={t.id} ref={(el) => { tabRefs.current[t.id] = el; }} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="painel-aba" tabIndex={tab === t.id ? 0 : -1} className="tab type-label-lg" onClick={() => select(t.id)}>
            <t.icon size={20} aria-hidden /> {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="painel-aba" aria-labelledby={`tab-${tab}`}>
        {tab === 'roteiro' && <Roteiro trip={trip} canEdit={canEdit} />}
        {tab === 'mapa' && <MapaTab trip={trip} />}
        {tab === 'clima' && <ClimaTab trip={trip} />}
        {tab === 'orcamento' && <OrcamentoTab trip={trip} canEdit={canEdit} />}
        {tab === 'membros' && <MembrosTab trip={trip} meId={me.data?.id} />}
        {tab === 'despesas' && (
          <section aria-labelledby="desp-h" className="stack">
            <h2 id="desp-h" className="type-headline-sm card-title">Despesas</h2>
            <Alert kind="info">A divisão de despesas está a caminho: a API ainda não expõe as rotas de despesas, saldos e acertos.</Alert>
            <div className="card"><EmptyState icon={Receipt} text="Quando as despesas estiverem disponíveis, você registra quem pagou e vê quanto cada um deve." /></div>
          </section>
        )}
      </div>

      <EditarViagemDialog trip={trip} open={editing} onClose={() => setEditing(false)} />

      {trip.myRole === 'OWNER' && (
        <div style={{ marginTop: 'var(--spacing-3xl)', display: 'flex', justifyContent: 'flex-end' }}>
          {mut.removeTrip.error && <Alert kind="error">{errorMessage(mut.removeTrip.error, 'excluir esta viagem')}</Alert>}
          <Button variant="danger" icon={Trash} busy={mut.removeTrip.isPending} onClick={() => window.confirm(`Excluir “${trip.name}”? Isso não pode ser desfeito.`) && mut.removeTrip.mutate(undefined, { onSuccess: () => navigate('/viagens', { replace: true }) })}>
            Excluir viagem
          </Button>
        </div>
      )}
    </div>
  );
}
