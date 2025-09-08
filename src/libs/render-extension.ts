import React from "react";
import ReactDOM from "react-dom/client";
import "../assets/css/root.css";

export function renderExtension(App: React.ReactNode) {
  const rootEl = document.createElement("div");
  rootEl.id = "focus-mode-extension-root";
  document.documentElement.appendChild(rootEl);
  ReactDOM.createRoot(rootEl).render(App);
}
