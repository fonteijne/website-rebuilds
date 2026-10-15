import { useSyncExternalStore } from 'react';

// Shared media queries. Mobile-first: the plain page is built for a phone on touch,
// and these queries opt into the heavier desktop-only enhancements.
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  // Matches the CSS boundary where the pinned scroll sections take over from swipe rows.
  desktop: '(min-width: 900px)',
  small: '(max-width: 599px)',
  // A real mouse/trackpad: hover effects make sense.
  finePointer: '(hover: hover) and (pointer: fine)',
};

// Pointer + width together: canvas effects (grain, click sparks) only run here.
export const MQ_RICH = `${MQ.finePointer} and ${MQ.desktop}`;

export const matches = (query) => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;

const noop = () => {};

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia?.(query);
      if (!mql) return noop;
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => matches(query),
    () => false
  );
}

export const useFinePointer = () => useMediaQuery(MQ.finePointer);
