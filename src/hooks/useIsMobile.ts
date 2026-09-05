import { useEffect, useState } from 'react';

export const MOBILE_BREAKPOINT = 768;

/** Mobile branch media query: narrow viewports OR phone-landscape (short + landscape —
 *  a rotated phone must keep the mobile layout, otherwise a 844px-wide/390px-tall viewport
 *  hits the desktop branch and the board/roster stop fitting). */
export const MOBILE_MEDIA_QUERY =
  `(max-width: ${MOBILE_BREAKPOINT}px), (max-height: 600px) and (orientation: landscape)`;

/** Mobile branch hook: true when the viewport matches the mobile media query.
 *  Styles live in @media blocks; this hook is only for behavioural branches (JSX, placement). */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MEDIA_QUERY).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
