import { describe, expect, it } from 'vitest';
import { withOwner } from './members';
import type { Member, User } from './types';

const u = (id: number, name: string): User => ({ id, name, email: `${id}@t`, avatarUrl: null });
const m = (id: number, user: User, role: Member['role']): Member => ({ id, user, role });

describe('withOwner', () => {
  it('coloca o dono no topo quando a API não o lista (viagem recém-criada)', () => {
    const list = withOwner(u(1, 'Bernardo'), []);
    expect(list).toEqual([{ id: -1, user: u(1, 'Bernardo'), role: 'OWNER' }]);
  });

  it('não duplica o dono quando ele já vem na lista', () => {
    const list = withOwner(u(1, 'Ana'), [m(10, u(2, 'Bia'), 'EDITOR'), m(11, u(1, 'Ana'), 'OWNER')]);
    expect(list.map((x) => [x.id, x.user.name, x.role])).toEqual([[11, 'Ana', 'OWNER'], [10, 'Bia', 'EDITOR']]);
  });

  it('sem dono conhecido, devolve a lista como veio', () => {
    const list = [m(10, u(2, 'Bia'), 'VIEWER')];
    expect(withOwner(null, list)).toBe(list);
  });
});
