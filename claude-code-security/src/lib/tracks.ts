import type { Track } from '../content/types';
import { href } from './route';

/** Per-track look and navigation, so components don't hard-code three-way colour switches. */
export const TRACK: Record<Track, { name: string; color: string; hex: string; text: string; btn: string; page: string; next: { href: string; label: string } }> = {
  core: { name: 'Core track', color: 'var(--color-guard)', hex: '#4fd1b5', text: 'text-guard', btn: 'btn-primary', page: href.home, next: { href: href.ios, label: 'On to the iOS track →' } },
  ios: { name: 'iOS track', color: 'var(--color-ios)', hex: '#a993fa', text: 'text-ios', btn: 'btn-ios', page: href.ios, next: { href: href.offline, label: 'On to the offline track →' } },
  offline: { name: 'Offline track', color: 'var(--color-air)', hex: '#f59e5b', text: 'text-air', btn: 'btn-air', page: href.offline, next: { href: href.build, label: 'Open the Builder →' } },
};
