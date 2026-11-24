// Gera os tokens a partir do DESIGN.md. Rode com `npm run design:tokens`.
//
// - tokens/tokens.css  -> bloco @theme do Tailwind v4 (para o app Next.js)
// - tokens/tokens.json -> formato DTCG (Figma, Style Dictionary...)
// - tokens/tokens.root.css -> as mesmas variáveis em :root, para CSS puro
//   (é o que o protótipo usa), mais as sombras da seção Elevation & Depth,
//   que o formato DESIGN.md ainda não tem como token.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const exportAs = (format) =>
  execFileSync('npx', ['designmd', 'export', '--format', format, 'DESIGN.md'], {
    encoding: 'utf8',
  });

const SHADOWS = `
  /* Elevation & Depth (DESIGN.md): o formato ainda não tem tokens de sombra. */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.14);
  --scrim: rgba(31, 31, 31, 0.4);
`;

// O export do CLI (0.4.0) ainda não leva lineHeight nem fontFeature: completamos
// aqui, na convenção do Tailwind v4 (--text-<nome>--line-height).
const frontMatter = readFileSync('DESIGN.md', 'utf8').split(/^---$/m)[1];
const { typography } = parse(frontMatter);
const typographyExtras = Object.entries(typography)
  .flatMap(([name, style]) => [
    style.lineHeight !== undefined && `  --text-${name}--line-height: ${style.lineHeight};`,
    style.fontFeature && `  --font-feature-${name}: ${style.fontFeature};`,
  ])
  .filter(Boolean)
  .join('\n');

mkdirSync('tokens', { recursive: true });

const theme = exportAs('css-tailwind').replace(
  /\}\s*$/,
  `\n  /* lineHeight e fontFeature do DESIGN.md */\n${typographyExtras}\n}\n`,
);
writeFileSync('tokens/tokens.css', theme);
writeFileSync('tokens/tokens.json', exportAs('dtcg'));

const header =
  '/* Gerado por scripts/build-tokens.mjs a partir do DESIGN.md. Não edite à mão. */\n';
const root = theme.replace('@theme {', ':root {').replace(/\}\s*$/, `${SHADOWS}}\n`);
writeFileSync('tokens/tokens.root.css', header + root);

console.log('tokens/tokens.css, tokens/tokens.json e tokens/tokens.root.css atualizados.');
