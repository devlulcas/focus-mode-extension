import React from "react";
import ReactDOM from "react-dom/client";
import { BlockCurrentTabWebsite } from "./src/component/block-current-tab-website.js";
import { BlockWebsiteList } from "./src/component/block-website-list.js";
import { ToggleBlocker } from "./src/component/toggle-blocker.js";
import { Providers } from "./src/contexts/providers.js";

function App() {
  return (
    <Providers>
      <div>
        <h1>Blocked Websites</h1>
        <BlockCurrentTabWebsite />
        <BlockWebsiteList />
        <ToggleBlocker />
      </div>
    </Providers>
  );
}

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootEl).render(<App />);
