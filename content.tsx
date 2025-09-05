import React from "react";
import ReactDOM from "react-dom/client";
import { BlockedDialog } from "./src/components/blocked-dialog.js";

function App() {
  return (
    <div>
      <BlockedDialog />
    </div>
  );
}

const rootEl = document.createElement("div");
rootEl.id = "focus-mode-extension-root";
document.documentElement.appendChild(rootEl);

const rootFocusModeExtension = document.getElementById(
  "focus-mode-extension-root"
);

if (!rootFocusModeExtension) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootFocusModeExtension).render(<App />);
