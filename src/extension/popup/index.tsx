import React from "react";
import { GlobalAskQuestionDialogProvider } from "../../components/ask-question-dialog.js";
import { BlockCurrentTabWebsite } from "../../components/block-current-tab-website.js";
import { BlockWebsiteList } from "../../components/block-website-list.js";
import { ToggleBlocker } from "../../components/toggle-blocker.js";
import { renderExtension } from "../../libs/render-extension.ts";
import styles from "./index.module.css";

function App() {
  return (
    <GlobalAskQuestionDialogProvider>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.title}>Focus Mode</h1>
          <p className={styles.subtitle}>
            Block distracting websites to stay focused
          </p>
        </header>
        <main className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Toggle Blocker</h2>
            <div className={styles.sectionContent}>
              <ToggleBlocker />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Current Tab</h2>
            <div className={styles.sectionContent}>
              <BlockCurrentTabWebsite />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Blocked Websites</h2>
            <div className={styles.sectionContent}>
              <BlockWebsiteList />
            </div>
          </section>
        </main>
      </div>
    </GlobalAskQuestionDialogProvider>
  );
}

renderExtension(<App />);
