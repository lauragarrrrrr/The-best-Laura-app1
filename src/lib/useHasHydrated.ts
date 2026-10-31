import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `false` durante el render en servidor e hidratación; `true` en cliente. */
export function useHasHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
