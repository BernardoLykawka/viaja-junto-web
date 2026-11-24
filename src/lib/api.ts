import { API_URL } from './env';
import { expireSession, getAccessToken } from './auth';

export interface FieldError {
  field: string;
  issue: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: FieldError[] = [],
    public retryAfter?: number,
  ) {
    super(message);
  }
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  /** Rotas públicas (ex.: catálogo) funcionam sem login. */
  anonymous?: boolean;
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const url = new URL(API_URL + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (!opts.anonymous) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Não consegui falar com o servidor. Verifique sua conexão e tente de novo.');
  }

  if (res.status === 401 && !opts.anonymous) expireSession();
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const json = text ? safeParse(text) : undefined;
  if (!res.ok) {
    const retry = Number(res.headers.get('Retry-After'));
    throw new ApiError(
      res.status,
      json?.code ?? 'ERROR',
      json?.message ?? res.statusText,
      Array.isArray(json?.details) ? json.details : [],
      Number.isFinite(retry) && retry > 0 ? retry : undefined,
    );
  }
  return json as T;
}

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Mensagem em pt-BR para o usuário (AGENTS.md › Conteúdo). `what` completa o 403, ex.: "editar esta viagem". */
export function errorMessage(err: unknown, what = 'fazer isso'): string {
  if (!(err instanceof ApiError)) return 'Algo deu errado. Tente de novo.';
  switch (err.status) {
    case 0:
      return err.message;
    case 401:
      return 'Sua sessão expirou. Entre de novo para continuar.';
    case 403:
      return `Você não tem permissão para ${what}.`;
    case 404:
      return 'Não encontramos o que você procura. Ele pode ter sido removido.';
    case 409:
      return err.message || 'Isso conflita com algo que já existe. Revise e tente de novo.';
    case 422:
      return err.details.map((d) => d.issue).join(' ') || err.message;
    case 429:
      return `Muitas tentativas. Tente de novo em ${err.retryAfter ?? 30} segundos.`;
    default:
      return err.status >= 500 ? 'O servidor teve um problema. Tente de novo em instantes.' : err.message;
  }
}

/** Mensagens de campo (422) indexadas pelo nome do campo, para mostrar sob cada input. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError)) return {};
  return Object.fromEntries(err.details.map((d) => [d.field, d.issue]));
}
