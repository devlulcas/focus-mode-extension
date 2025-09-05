import { array, object, safeParse, type InferOutput } from "valibot";
import { Err, Ok, Result, wrapAsync } from "../libs/result.js";
import { createStorageKey } from "../libs/storage-key.js";
import { removeDuplicates, Website } from "../model/website.js";

export const blockedWebsitesStorageKey = createStorageKey("blockedDomains", 2);

export const BlockedWebsitesStorage = object({
  [blockedWebsitesStorageKey]: array(Website),
});

export type BlockedWebsitesStorage = InferOutput<typeof BlockedWebsitesStorage>;

export function parseBlockedWebsitesStorage(storage: unknown) {
  const parsed = safeParse(BlockedWebsitesStorage, storage);

  if (parsed.success) {
    return removeDuplicates(parsed.output[blockedWebsitesStorageKey]);
  }

  return null;
}

export async function getBlockedWebsites(): Promise<Result<Website[], Error>> {
  const storage = await wrapAsync(() => {
    return chrome.storage.local.get(blockedWebsitesStorageKey);
  });

  if (storage.isErr()) {
    return Err(storage.getErr());
  }

  const parsed = parseBlockedWebsitesStorage(storage.unwrap());

  return Ok(parsed || []);
}

export async function postBlockedWebsites(
  blockedWebsites: Website[]
): Promise<Result<boolean, Error>> {
  const result = await getBlockedWebsites();

  if (result.isErr()) {
    return Err(result.getErr());
  }

  const blockedWebsitesStorage = result.unwrap();

  const parsed = parseBlockedWebsitesStorage({
    [blockedWebsitesStorageKey]: [
      ...blockedWebsitesStorage,
      ...blockedWebsites,
    ],
  });

  const setResult = await wrapAsync(async () => {
    await chrome.storage.local.set({
      [blockedWebsitesStorageKey]: parsed || [],
    });

    return true;
  });

  return setResult;
}

export async function putBlockedWebsites(websites: Website[]) {
  const getResult = await getBlockedWebsites();

  if (getResult.isErr()) {
    return Err(getResult.getErr());
  }

  const oldWebsites = getResult.unwrap();

  const newWebsites = parseBlockedWebsitesStorage({
    [blockedWebsitesStorageKey]: websites,
  });

  const setResult = await wrapAsync(async () => {
    await chrome.storage.local.set({
      [blockedWebsitesStorageKey]: newWebsites || [],
    });

    return true;
  });

  if (setResult.isErr()) {
    const undoResult = await wrapAsync(async () => {
      await chrome.storage.local.set({
        [blockedWebsitesStorageKey]: oldWebsites || [],
      });

      return true;
    });

    return undoResult.isErr() ? undoResult : setResult;
  }

  return setResult;
}

export async function patchBlockedWebsites(websites: Website[]) {
  const getResult = await getBlockedWebsites();

  if (getResult.isErr()) {
    return Err(getResult.getErr());
  }

  const oldWebsites = getResult.unwrap();

  const replacedWebsites = oldWebsites.map((website) => {
    const newWebsite = websites.find((w) => w.domain === website.domain);
    return newWebsite ?? website;
  });

  const setResult = await putBlockedWebsites(replacedWebsites);

  return setResult;
}

export async function upsertBlockedWebsite(website: Website) {
  const getResult = await getBlockedWebsites();

  if (getResult.isErr()) {
    return Err(getResult.getErr());
  }

  const oldWebsites = getResult.unwrap();

  const newWebsiteIndex = oldWebsites.findIndex(
    (w) => w.domain === website.domain
  );

  if (newWebsiteIndex === -1) {
    return postBlockedWebsites([website]);
  }

  return patchBlockedWebsites([website]);
}

type Listener = (
  blockedWebsites: Website[],
  areaName: chrome.storage.AreaName
) => void;

export function listenToBlockedWebsitesStorageChanges(callback: Listener) {
  const listener = (
    changes: {
      [key: string]: chrome.storage.StorageChange;
    },
    areaName: chrome.storage.AreaName
  ) => {
    if (changes[blockedWebsitesStorageKey]) {
      const newValue = changes[blockedWebsitesStorageKey].newValue;

      const parsed = parseBlockedWebsitesStorage({
        [blockedWebsitesStorageKey]: newValue,
      });

      callback(parsed || [], areaName);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}
