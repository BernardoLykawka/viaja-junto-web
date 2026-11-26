import { useEffect, useState } from 'react';
import { Airplane } from '@phosphor-icons/react';

const TRAIL = 'M2 20 C 20 22, 34 4, 56 8 S 78 12, 86 6';

/**
 * Avião do sobretítulo do hero voando sobre o rastro tracejado (DESIGN.md › Motion).
 * Usa <animateMotion> do SVG: o avião segue a curva e gira junto com ela (rotate="auto").
 * Com "reduzir movimento" ligado no sistema, fica parado no fim do rastro.
 */
export function HeroPlane() {
  const reduced = usePrefersReducedMotion();
  return (
    <svg className="hero-plane" viewBox="0 0 88 24" fill="none" aria-hidden>
      <path id="hero-trail" d={TRAIL} stroke="currentColor" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      {reduced ? (
        <g transform="translate(86 6) rotate(60)">
          <Airplane weight="fill" size={20} x={-10} y={-10} />
        </g>
      ) : (
        <g>
          {/* 0–80% do ciclo: voa do começo ao fim do rastro; 80–100%: some e recomeça. */}
          <animateMotion dur="4s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1">
            <mpath href="#hero-trail" />
          </animateMotion>
          <animate attributeName="opacity" dur="4s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.1;0.75;0.85;1" />
          {/* O ícone do Phosphor aponta para cima; o rotate="auto" considera "para a direita" a frente. */}
          <g transform="rotate(90)">
            <Airplane weight="fill" size={20} x={-10} y={-10} />
          </g>
        </g>
      )}
    </svg>
  );
}

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
