import React from "react";
import ReactDOM from "react-dom/client";
import { BlockCurrentTabWebsite } from "./src/components/block-current-tab-website.js";
import { BlockWebsiteList } from "./src/components/block-website-list.js";
import { ToggleBlocker } from "./src/components/toggle-blocker.js";

function App() {
  return (
    <div>
      <h1>Blocked Websites</h1>
      <ToggleBlocker />
      <BlockCurrentTabWebsite />
      <BlockWebsiteList />
    </div>
  );
}

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootEl).render(<App />);
