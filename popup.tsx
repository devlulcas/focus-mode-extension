import React from "react";
import ReactDOM from "react-dom/client";
import styles from "./popup.module.css";
import { BlockCurrentTabWebsite } from "./src/components/block-current-tab-website.js";
import { BlockWebsiteList } from "./src/components/block-website-list.js";
import { ToggleBlocker } from "./src/components/toggle-blocker.js";

import "./src/assets/css/reset.css";
import "./src/assets/css/theme.css";
import { GlobalAskQuestionDialogProvider } from "./src/components/ask-question-dialog.js";

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

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootEl).render(<App />);
