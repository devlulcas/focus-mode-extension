import { atom } from "nanostores";
import { useEffect } from "react";
import { getCurrentActiveTab } from "../libs/tabs.js";
import { fromJSON, type Website } from "../model/website.js";

export const $blockedWebsitesAtom = atom<Website[]>([]);

export function useSyncBlockedWebsites() {
  useEffect(() => {
    const listener = (changes: any) => {
      if (changes.blockedDomains) {
        const blockedWebsites: (Website | null)[] =
          changes.blockedDomains.newValue.map((b: unknown): Website | null => {
            const parsed = fromJSON(b);
            if (parsed.success) {
              return parsed.output;
            }
            return null;
          });

        const filteredBlockedWebsites = blockedWebsites.filter(
          (b): b is Website => b !== null
        );

        $blockedWebsitesAtom.set(filteredBlockedWebsites);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);
}

export async function addCurrentActiveTabToBlockedWebsites() {
  const tab = await getCurrentActiveTab();

  if (!tab) return;

  const blockedWebsite: Website = {
    domain: tab.url.hostname,
    title: tab.title ?? "unknown",
    favicon: tab.favIconUrl ?? "",
  };

  const oldBlockedWebsites = await chrome.storage.local.get("blockedDomains");

  const blockedWebsites: (Website | null)[] =
    oldBlockedWebsites.blockedDomains.map((b: unknown): Website | null => {
      const parsed = fromJSON(b);

      if (parsed.success) {
        return parsed.output;
      }

      return null;
    });

  const newBlockedWebsites: Website[] = [
    ...blockedWebsites,
    blockedWebsite,
  ].filter((b) => b !== null);

  const withoutDuplicates = newBlockedWebsites.filter(
    (b, index, self) => index === self.findIndex((t) => t.domain === b.domain)
  );

  await chrome.storage.local.set({ blockedDomains: withoutDuplicates });
}

export async function removeFromBlockedWebsites(domain: string) {
  const oldBlockedWebsites = await chrome.storage.local.get("blockedDomains");

  const blockedWebsites: (Website | null)[] =
    oldBlockedWebsites.blockedDomains.map((b: unknown): Website | null => {
      const parsed = fromJSON(b);
      if (parsed.success) {
        return parsed.output;
      }
      return null;
    });

  const newBlockedWebsites: Website[] = blockedWebsites.filter(
    (b: Website | null): b is Website => b !== null && b.domain !== domain
  );

  await chrome.storage.local.set({ blockedDomains: newBlockedWebsites });
}

export async function cleanupBlockedWebsites() {
  await chrome.storage.local.remove("blockedDomains");
}
