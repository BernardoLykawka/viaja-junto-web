import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// O jsdom não implementa rolagem; o Layout rola para o topo a cada troca de rota.
window.scrollTo = () => {};
