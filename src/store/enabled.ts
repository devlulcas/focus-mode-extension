import { atom } from "nanostores";
import { useEffect } from "react";

export const $enabledAtom = atom(true);

export function toggleEnabled() {
  const newState = !$enabledAtom.get();
  $enabledAtom.set(newState);
  return newState;
}

export function useSyncEnabled() {
  useEffect(() => {
    const listener = (changes: any) => {
      if (changes.enabled) {
        $enabledAtom.set(changes.enabled.newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);
}
