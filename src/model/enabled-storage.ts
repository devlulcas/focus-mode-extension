import { object, safeParse, type InferOutput } from "valibot";
import { wrapAsync } from "../libs/result.js";
import { createStorageKey } from "../libs/storage-key.js";
import { StoredBoolean } from "./boolean.js";

export const enabledStorageKey = createStorageKey("enabled", 1);

export const EnabledStorage = object({
  [enabledStorageKey]: StoredBoolean,
});

export type EnabledStorage = InferOutput<typeof EnabledStorage>;

export function parseEnabledStorage(storage: unknown) {
  const parsed = safeParse(EnabledStorage, storage);
  return parsed.success && parsed.output[enabledStorageKey];
}

export async function getEnabled() {
  const result = await wrapAsync(async () => {
    const storage = await chrome.storage.local.get(enabledStorageKey);
    return parseEnabledStorage(storage);
  });

  return result.unwrapOr(false);
}

export async function setEnabled(enabled: boolean) {
  const result = await wrapAsync(async () => {
    await chrome.storage.local.set({ [enabledStorageKey]: enabled });
    return enabled;
  });

  return result.unwrapOr(false);
}

export async function toggleEnabled() {
  const enabled = await getEnabled();
  return setEnabled(!enabled);
}

export function listenToEnabledStorageChanges(
  callback: (enabled: boolean) => void
) {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: chrome.storage.AreaName
  ) => {
    if (areaName === "local" && changes[enabledStorageKey]) {
      const newValue = changes[enabledStorageKey].newValue;

      const parsed = parseEnabledStorage({
        [enabledStorageKey]: newValue,
      });

      callback(parsed);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}
