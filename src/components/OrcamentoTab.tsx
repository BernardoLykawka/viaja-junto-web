import { useState, type FormEvent } from 'react';
import { PencilSimple, Wallet } from '@phosphor-icons/react';
import { errorMessage, fieldErrors } from '../lib/api';
import { money, percent } from '../lib/format';
import { useBudget, useTripMutations } from '../lib/queries';
import type { Trip } from '../lib/types';
import { Alert, Button, Dialog, EmptyState, Field, Skeleton } from './ui';
import { categoryIcon } from '../lib/activityTypes';

export function OrcamentoTab({ trip, canEdit }: { trip: Trip; canEdit: boolean }) {
  const { data: b, isLoading, error } = useBudget(trip.id);
  const { setBudget } = useTripMutations(trip.id);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const errs = fieldErrors(setBudget.error);

  function submit(e: FormEvent) {
    e.preventDefault();
    setBudget.mutate(Number(value), { onSuccess: () => setEditing(false) });
  }
  const openEdit = () => { setValue(b?.total != null ? String(b.total) : ''); setBudget.reset(); setEditing(true); };

  if (isLoading) return <Skeleton style={{ height: 200 }} />;
  if (error || !b) return <Alert kind="error">{errorMessage(error, 'ver o orçamento desta viagem')}</Alert>;

  const hasTotal = b.total != null && b.total > 0;
  const over = hasTotal && b.planned > (b.total ?? 0);

  return (
    <section aria-labelledby="orc-h" className="stack">
      <div className="section-head">
        <h2 id="orc-h" className="type-headline-sm card-title">Orçamento</h2>
        {canEdit && <Button variant="secondary" icon={PencilSimple} onClick={openEdit}>{hasTotal ? 'Ajustar orçamento' : 'Definir orçamento'}</Button>}
      </div>

      <div className="kpis" style={{ marginBottom: 0 }}>
        <div className="card kpi"><span className="type-label-sm muted">Orçamento total</span><span className="type-numeric-lg">{hasTotal ? money(b.total) : 'Não definido'}</span></div>
        <div className="card kpi"><span className="type-label-sm muted">Planejado</span><span className="type-numeric-lg">{money(b.planned)}</span></div>
        <div className="card kpi"><span className="type-label-sm muted">{over ? 'Acima do orçamento' : 'Disponível'}</span><span className="type-numeric-lg">{hasTotal ? money(Math.abs(b.available ?? 0)) : '–'}</span></div>
        <div className="card kpi"><span className="type-label-sm muted">Consumido</span><span className="type-numeric-lg">{hasTotal ? percent(b.percentConsumed) : '–'}</span></div>
      </div>

      {over && <Alert kind="warning">O planejado passou {money(b.planned - (b.total ?? 0))} do orçamento. Revise as atividades ou aumente o total.</Alert>}

      {!hasTotal && b.planned === 0 ? (
        <div className="card"><EmptyState icon={Wallet} text={canEdit ? 'Defina um orçamento total e acompanhe quanto cada categoria consome.' : 'O orçamento desta viagem ainda não foi definido.'} /></div>
      ) : (
        <div className="card">
          <h3 className="type-title-md" style={{ marginBottom: 'var(--spacing-md)' }}>Por categoria</h3>
          {hasTotal && (
            <div className="progress-track" role="progressbar" aria-label="Orçamento consumido" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(b.percentConsumed))} style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, b.percentConsumed)}%` }} />
            </div>
          )}
          {b.byCategory.length === 0 ? (
            <p className="type-body-sm muted">Nenhuma atividade com valor previsto ainda.</p>
          ) : (
            <div className="cat-rows">
              {b.byCategory.map((c) => {
                const I = categoryIcon(c.category);
                return (
                  <div key={c.category} className="cat-row">
                    <div className="row">
                      <span className="label type-label-lg"><I size={20} aria-hidden /> {c.category}</span>
                      <span className="type-numeric-md">{money(c.total)}</span>
                    </div>
                    {hasTotal && <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, c.percent)}%` }} /></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={editing} onClose={() => setEditing(false)} title="Orçamento total">
        <form className="form" onSubmit={submit} noValidate>
          {setBudget.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(setBudget.error, 'alterar o orçamento')}</Alert>}
          <Field label="Valor total (R$)" htmlFor="o-total" error={errs.orcamentoTotal}><input id="o-total" type="number" inputMode="decimal" min={0} step="0.01" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button type="submit" busy={setBudget.isPending} disabled={value === '' || Number(value) < 0}>Salvar</Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
