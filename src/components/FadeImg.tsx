import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

/**
 * Pede ao Unsplash uma versão no tamanho em que a foto é mostrada: os originais têm 5.000 px ou mais e
 * deixavam os cards lentos. Outras origens (Wikimedia já vem com 960 px) passam como estão.
 */
export function sizedPhoto(url: string | undefined, width = 800): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname !== 'images.unsplash.com' || u.searchParams.has('w')) return url;
    u.searchParams.set('w', String(width));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('q', '70');
    return u.toString();
  } catch {
    return url;
  }
}

/** Foto que aparece com fade ao terminar de carregar (DESIGN.md › Motion). Já em cache, aparece na hora. */
export function FadeImg({ className = '', onLoad, src, width, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { width?: number }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);
  return (
    <img
      ref={ref}
      className={`fade ${loaded ? 'loaded' : ''} ${className}`}
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      src={sizedPhoto(typeof src === 'string' ? src : undefined, width)}
      decoding="async"
      {...rest}
    />
  );
}
