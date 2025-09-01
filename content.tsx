import React from "react";
import ReactDOM from "react-dom/client";
import { BlockedDialog } from "./src/component/blocked-dialog.js";

function App() {
  return (
    <div>
      <BlockedDialog />
    </div>
  );
}

const rootEl = document.createElement("div");
document.body.appendChild(rootEl);

ReactDOM.createRoot(rootEl).render(<App />);
