import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AirplaneTilt, MagnifyingGlass, MapPin, X } from '@phosphor-icons/react';
import { categoryIcon } from '../lib/activityTypes';
import { useAuth } from '../lib/auth';
import { dateRange } from '../lib/format';
import { useAllCatalogActivities, usePlaces, useTrips } from '../lib/queries';
import type { Icon } from '@phosphor-icons/react';

interface Result {
  key: string;
  group: 'Minhas viagens' | 'Destinos' | 'Atividades';
  title: string;
  subtitle: string;
  to: string;
  icon: Icon;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PER_GROUP = 6;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const SHORTCUT_LABEL = isMac ? '⌘K' : 'Ctrl K';

/**
 * Busca rápida (Ctrl+K ou ⌘K, ou o botão da barra): procura de uma vez em viagens do usuário, destinos e
 * atividades do catálogo. Setas sobem e descem, Enter abre, Esc fecha. Os dados já vêm do cache das telas.
 */
export function QuickSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { status } = useAuth();
  const trips = useTrips();
  const places = usePlaces('');
  const activities = useAllCatalogActivities();

  // Atalho global.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      setQ('');
      setActive(0);
      d.showModal();
      input.current?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const t = norm(q.trim());
    const match = (...fields: (string | null | undefined)[]) => !t || fields.some((f) => f && norm(f).includes(t));
    const tripResults: Result[] = (status === 'authed' ? trips.data?.data ?? [] : [])
      .filter((tr) => match(tr.name, tr.description))
      .slice(0, PER_GROUP)
      .map((tr) => ({ key: `t${tr.id}`, group: 'Minhas viagens', title: tr.name, subtitle: dateRange(tr.startDate, tr.endDate), to: `/viagens/${tr.id}`, icon: AirplaneTilt }));
    const placeResults: Result[] = (places.data?.data ?? [])
      .filter((p) => match(p.name, p.city, p.country, p.category))
      .slice(0, PER_GROUP)
      .map((p) => ({ key: `p${p.id}`, group: 'Destinos', title: p.name, subtitle: [p.city !== p.name ? p.city : null, p.country].filter(Boolean).join(', '), to: `/destinos/${p.id}`, icon: MapPin }));
    const activityResults: Result[] = (activities.data ?? [])
      .filter((a) => match(a.name, a.city, a.country, a.type, a.location))
      .slice(0, PER_GROUP)
      .map((a) => ({ key: `a${a.id}`, group: 'Atividades', title: a.name, subtitle: [a.type, a.city].filter(Boolean).join(' · '), to: `/atividades/${a.id}`, icon: categoryIcon(a.type) }));
    return [...tripResults, ...placeResults, ...activityResults];
  }, [q, status, trips.data, places.data, activities.data]);

  useEffect(() => setActive(0), [q]);

  function go(r: Result | undefined) {
    if (!r) return;
    setOpen(false);
    navigate(r.to);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); go(results[active]); }
  }

  // Mantém o item ativo à vista quando se navega pelas setas.
  useEffect(() => {
    dialog.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const groups = ['Minhas viagens', 'Destinos', 'Atividades'] as const;
  return (
    <>
      <button type="button" className="search-trigger type-label-md" onClick={() => setOpen(true)} aria-keyshortcuts="Control+K Meta+K">
        <MagnifyingGlass size={20} aria-hidden />
        <span className="search-trigger-text">Buscar</span>
        <kbd className="type-label-sm">{SHORTCUT_LABEL}</kbd>
      </button>
      <dialog ref={dialog} className="dialog search-dialog" onClose={() => setOpen(false)} onClick={(e) => e.target === dialog.current && setOpen(false)} aria-label="Busca rápida">
        {open && (
          <div className="search-panel" onKeyDown={onKeyDown}>
            <div className="search-input-row">
              <MagnifyingGlass size={22} aria-hidden />
              <input
                ref={input}
                className="type-body-lg"
                placeholder="Buscar viagens, destinos e atividades…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                role="combobox"
                aria-expanded="true"
                aria-controls="busca-resultados"
                aria-activedescendant={results[active] ? `busca-${results[active].key}` : undefined}
                aria-autocomplete="list"
              />
              <button type="button" className="icon-button" aria-label="Fechar busca" onClick={() => setOpen(false)}><X size={20} aria-hidden /></button>
            </div>
            <div id="busca-resultados" role="listbox" className="search-results" aria-label="Resultados">
              {results.length === 0 && <p className="type-body-md muted search-empty">Nada encontrado para “{q}”.</p>}
              {groups.map((g) => {
                const items = results.filter((r) => r.group === g);
                if (!items.length) return null;
                return (
                  <div key={g} role="group" aria-label={g}>
                    <p className="type-label-sm muted search-group">{g}</p>
                    {items.map((r) => {
                      const index = results.indexOf(r);
                      return (
                        <div
                          key={r.key}
                          id={`busca-${r.key}`}
                          role="option"
                          aria-selected={index === active}
                          data-index={index}
                          className="search-item"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(r)}
                        >
                          <span className="cat-icon"><r.icon size={20} aria-hidden /></span>
                          <span style={{ minWidth: 0 }}>
                            <span className="type-title-md search-item-title">{r.title}</span>
                            <span className="type-body-sm muted">{r.subtitle}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <p className="search-help type-body-sm muted"><kbd>↑</kbd> <kbd>↓</kbd> navegar · <kbd>Enter</kbd> abrir · <kbd>Esc</kbd> fechar</p>
          </div>
        )}
      </dialog>
    </>
  );
}
