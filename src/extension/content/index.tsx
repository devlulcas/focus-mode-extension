import React from "react";
import { BlockedDialog } from "../../components/blocked-dialog.js";
import { renderExtension } from "../../libs/render-extension.ts";
import { I18nProvider } from "../../store/i18n.tsx";

import "./index.module.css";

function App() {
  return (
    <I18nProvider>
      <BlockedDialog />
    </I18nProvider>
  );
}

renderExtension(<App />);
