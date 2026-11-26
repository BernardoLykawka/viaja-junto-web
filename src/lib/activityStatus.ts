import { CheckCircle, Clock, FlagCheckered, type Icon } from '@phosphor-icons/react';
import type { ActivityStatus } from './types';

/** Situação da atividade no roteiro, com ícone e texto (a cor nunca é o único sinal). */
export const ACTIVITY_STATUS_META: Record<ActivityStatus, { label: string; icon: Icon; badge: string }> = {
  PENDING: { label: 'Pendente', icon: Clock, badge: 'badge-planning' },
  CONFIRMED: { label: 'Confirmada', icon: CheckCircle, badge: 'badge-confirmed' },
  DONE: { label: 'Concluída', icon: FlagCheckered, badge: 'badge-completed' },
};
export const ACTIVITY_STATUSES = Object.keys(ACTIVITY_STATUS_META) as ActivityStatus[];
