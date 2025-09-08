import React from "react";
import { BlockedDialog } from "../../components/blocked-dialog.js";
import { renderExtension } from "../../libs/render-extension.ts";

function App() {
  return (
    <div>
      <BlockedDialog />
    </div>
  );
}

renderExtension(<App />);
