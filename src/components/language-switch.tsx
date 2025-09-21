import React, { use, useId } from "react";
import { i18n } from "../model/i18n.ts";
import { I18nContext } from "../store/i18n.tsx";
import styles from "./language-switch.module.css";

export function LanguageSwitch() {
  const { language, setPreferredLanguage } = use(I18nContext);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLanguage = event.target.checked ? i18n.pt.tag : i18n.en.tag;
    setPreferredLanguage(newLanguage);
  };

  const isPortuguese = language === i18n.pt.tag;

  const id = useId();

  return (
    <label className={styles.switchWrapper} htmlFor={id} title={language}>
      <input
        type="checkbox"
        checked={isPortuguese}
        onChange={handleChange}
        className={styles.input}
        id={id}
      />
      <span data-active={!isPortuguese} className={styles.label}>
        {i18n.en.name}
      </span>
      <span data-active={isPortuguese} className={styles.label}>
        {i18n.pt.name}
      </span>
    </label>
  );
}
