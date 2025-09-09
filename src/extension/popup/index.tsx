import React from "react";
import { GlobalAskQuestionDialogProvider } from "../../components/ask-question-dialog.js";
import { BlockCurrentTabWebsite } from "../../components/block-current-tab-website.js";
import { BlockWebsiteList } from "../../components/block-website-list.js";
import { LanguageSwitch } from "../../components/language-switch.js";
import { ToggleBlocker } from "../../components/toggle-blocker.js";
import { renderExtension } from "../../libs/render-extension.ts";
import { i18n, type Dictionary } from "../../model/i18n.ts";
import { I18nProvider, useI18n } from "../../store/i18n.tsx";
import styles from "./index.module.css";

const dictionary = {
  subtitle: {
    [i18n.en.tag]: "Block distracting websites to stay focused",
    [i18n.pt.tag]: "Bloqueie sites para focar",
  },
  currentTab: {
    [i18n.en.tag]: "Current Tab",
    [i18n.pt.tag]: "Aba atual",
  },
  blockedWebsites: {
    [i18n.en.tag]: "Blocked Websites",
    [i18n.pt.tag]: "Sites bloqueados",
  },
  toggleBlocker: {
    [i18n.en.tag]: "Toggle Blocker",
    [i18n.pt.tag]: "Alternar bloqueador",
  },
} as const satisfies Dictionary;

function Content() {
  const text = useI18n(dictionary);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.languageSection}>
              <h1 className={styles.title}>Focus Mode</h1>
              <LanguageSwitch />
            </div>
            <p className={styles.subtitle}>{text.subtitle}</p>
          </div>
        </div>
      </header>
      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{text.toggleBlocker}</h2>
          <div className={styles.sectionContent}>
            <ToggleBlocker />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{text.currentTab}</h2>
          <div className={styles.sectionContent}>
            <BlockCurrentTabWebsite />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{text.blockedWebsites}</h2>
          <div className={styles.sectionContent}>
            <BlockWebsiteList />
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <GlobalAskQuestionDialogProvider>
        <Content />
      </GlobalAskQuestionDialogProvider>
    </I18nProvider>
  );
}

renderExtension(<App />);
