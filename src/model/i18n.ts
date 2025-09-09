import { literal, object, safeParse, union, type InferOutput } from "valibot";
import { wrapAsync } from "../libs/result.ts";
import { createStorageKey } from "../libs/storage-key.ts";

export const i18n = {
  pt: {
    name: "Português",
    tag: "pt-BR",
  },
  en: {
    name: "English",
    tag: "en-US",
  },
} as const;

const Language = union([literal(i18n.en.tag), literal(i18n.pt.tag)]);

export type Language = InferOutput<typeof Language>;

export const i18nStorageKey = createStorageKey("i18n", 1);

const I18n = object({
  [i18nStorageKey]: Language,
});

function parseI18n(storage: unknown, defaultLanguage: Language = i18n.en.tag) {
  const parsed = safeParse(I18n, storage);
  return parsed.success ? parsed.output[i18nStorageKey] : defaultLanguage;
}

function getDefaultLanguage() {
  return parseI18n(chrome.i18n.getUILanguage());
}

export async function getPreferredLanguage() {
  const fromStorage = await wrapAsync(() =>
    chrome.storage.local.get(i18nStorageKey)
  );

  const defaultLanguage = getDefaultLanguage();

  if (fromStorage.isErr()) {
    return defaultLanguage;
  }

  const inStorage = parseI18n(fromStorage.unwrap(), defaultLanguage);

  return inStorage;
}

export async function setPreferredLanguage(language: Language) {
  const result = await wrapAsync(async () => {
    await chrome.storage.local.set({ [i18nStorageKey]: language });
    return language;
  });

  return result.unwrapOr(i18n.en.tag);
}

type Listener = (language: Language, areaName: chrome.storage.AreaName) => void;

export function listenToI18nStorageChanges(callback: Listener) {
  const listener = (
    changes: {
      [key: string]: chrome.storage.StorageChange;
    },
    areaName: chrome.storage.AreaName
  ) => {
    if (changes[i18nStorageKey]) {
      const newValue = {
        [i18nStorageKey]: changes[i18nStorageKey].newValue,
      };

      const defaultLanguage = getDefaultLanguage();
      const parsed = parseI18n(newValue, defaultLanguage);

      callback(parsed, areaName);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

export type Dictionary = Record<string, Record<Language, string>>;

export function interpolate(text: string, args: Record<string, unknown>) {
  return text.replace(
    /{(\w+)}/g,
    (match, key) => args[key]?.toString() ?? match
  );
}
