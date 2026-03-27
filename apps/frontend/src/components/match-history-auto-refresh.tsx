'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
export const AUTO_REFRESH_INTERVAL_MS = 30_000;
export function shouldRefreshMatchHistory(options: {
  visibilityState?: string;
  online?: boolean;
}): boolean {
  const {
    visibilityState = 'visible',
    online = true
  } = options;
  return visibilityState === 'visible' && online;
}
export function MatchHistoryAutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== '/matches') {
      return;
    }
    const refresh = () => {
      const online = typeof navigator === 'undefined' || !('onLine' in navigator) ? true : navigator.onLine;
      const visibilityState = typeof document === 'undefined' ? 'visible' : document.visibilityState;
      if (!shouldRefreshMatchHistory({
        visibilityState,
        online
      })) {
        return;
      }
      router.refresh();
    };
    const intervalId = window.setInterval(refresh, AUTO_REFRESH_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    const handleOnline = () => {
      refresh();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [pathname, router]);
  return null;
}
