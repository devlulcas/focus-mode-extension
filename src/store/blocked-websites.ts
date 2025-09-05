import { useEffect, useRef, useState } from "react";
import { Err, Ok } from "../libs/result.js";
import { getCurrentActiveTab } from "../libs/tabs.js";
import {
  getBlockedWebsites,
  listenToBlockedWebsitesStorageChanges,
  putBlockedWebsites,
  upsertBlockedWebsite,
} from "../model/blocked-website-storage.js";
import type { Website } from "../model/website.js";

export function useSyncBlockedWebsites() {
  const [state, setState] = useState<Website[]>([]);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current === false) {
      return;
    }

    const init = async () => {
      const result = await getBlockedWebsites();
      setState(result.unwrapOr([]));
      firstLoad.current = false;
    };

    init();

    return () => {
      firstLoad.current = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = listenToBlockedWebsitesStorageChanges((changes) => {
      console.log("listenToBlockedWebsitesStorageChanges", changes);
      setState(changes || []);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

export async function toggleCurrentActiveTabBlocking() {
  const tab = await getCurrentActiveTab();

  if (!tab) {
    return Err(new Error("No active tab"));
  }

  const getResult = await getBlockedWebsites();
  const exists = getResult
    .unwrapOr([])
    .find((b) => b.domain === tab.url.hostname);

  const newBlockedWebsite = {
    domain: tab.url.hostname,
    title: tab.title ?? "unknown",
    favicon: tab.favIconUrl ?? "",
    blocked: exists ? !exists.blocked : true,
  };

  return upsertBlockedWebsite(newBlockedWebsite);
}

export async function toggleBlockedWebsite(domain: string) {
  const result = await getBlockedWebsites();

  if (result.isErr()) {
    return Err(result.getErr());
  }

  const blockedWebsites = result.unwrap();

  const newBlockedWebsite = blockedWebsites.find((b) => b.domain === domain);

  if (!newBlockedWebsite) {
    return Err(new Error("Website not found"));
  }

  newBlockedWebsite.blocked = !newBlockedWebsite.blocked;

  const setResult = await upsertBlockedWebsite(newBlockedWebsite);

  if (setResult.isErr()) {
    return Err(setResult.getErr());
  }

  return Ok(setResult.unwrap());
}

export async function deleteBlockedWebsite(domain: string) {
  const result = await getBlockedWebsites();

  if (result.isErr()) {
    return Err(result.getErr());
  }

  const blockedWebsites = result.unwrap();

  const newBlockedWebsites = blockedWebsites.filter((b) => b.domain !== domain);

  return putBlockedWebsites(newBlockedWebsites);
}
