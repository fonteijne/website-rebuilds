import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'ios' }
  | { name: 'module'; id: string }
  | { name: 'build' }
  | { name: 'map' };

export function parse(hash: string): Route {
  const p = hash.replace(/^#\/?/, '').split('/');
  if (p[0] === 'm' && p[1]) return { name: 'module', id: p[1] };
  if (p[0] === 'ios') return { name: 'ios' };
  if (p[0] === 'build') return { name: 'build' };
  if (p[0] === 'map') return { name: 'map' };
  return { name: 'home' };
}

export function useRoute(): Route {
  const [r, setR] = useState<Route>(() => parse(location.hash));
  useEffect(() => {
    const h = () => setR(parse(location.hash));
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return r;
}

export const href = {
  home: '#/',
  ios: '#/ios',
  module: (id: string) => `#/m/${id}`,
  build: '#/build',
  map: '#/map',
};
