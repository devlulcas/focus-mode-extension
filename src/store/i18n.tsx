import React, { createContext, use, useEffect, useRef, useState } from "react";
import {
  getPreferredLanguage,
  i18n,
  listenToI18nStorageChanges,
  setPreferredLanguage,
  type Dictionary,
  type Language,
} from "../model/i18n.ts";

function useSyncI18n() {
  const [state, setState] = useState<Language>("en-US");
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current === false) {
      return;
    }

    const init = async () => {
      const result = await getPreferredLanguage();
      setState(result);
      firstLoad.current = false;
    };

    init();

    return () => {
      firstLoad.current = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = listenToI18nStorageChanges((language) => {
      setState(language);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

export const I18nContext = createContext<{
  language: Language;
  setPreferredLanguage: (language: Language) => void;
}>({
  language: i18n.en.tag,
  setPreferredLanguage,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncI18n();

  const changeLanguage = async (language: Language) => {
    await setPreferredLanguage(language);
  };

  const value = {
    language,
    setPreferredLanguage: changeLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n<T extends Dictionary>(dictionary: T) {
  const { language } = use(I18nContext);

  const proxy = new Proxy(dictionary, {
    get(target, prop) {
      return target[prop as keyof typeof target]?.[language];
    },
  });

  // From Record<string, Record<Language, string>> to Record<string, string>
  return proxy as unknown as Record<keyof T, string>;
}
