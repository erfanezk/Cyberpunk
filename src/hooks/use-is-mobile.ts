import { useMemo } from 'react';

export function useIsMobile(): boolean {
  return useMemo(() => window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent), []);
}
