import { useStore } from "@nanostores/react";
import React from "react";
import { useAsync } from "../hooks/use-async.js";
import { getCurrentActiveTab } from "../libs/tabs.js";
import {
  $blockedWebsitesAtom,
  addCurrentActiveTabToBlockedWebsites,
  removeFromBlockedWebsites,
} from "../store/blocked-websites.js";

export function BlockCurrentTabWebsite() {
  const blockedWebsites = useStore($blockedWebsitesAtom);

  const currentTabPromise = useAsync(getCurrentActiveTab);

  const isBlocked = blockedWebsites.some(
    (b) => b.domain === currentTabPromise.data?.url.hostname
  );

  if (currentTabPromise.loading) {
    return <div>Loading...</div>;
  }

  if (currentTabPromise.error) {
    return <div>Error</div>;
  }

  const currentTab = currentTabPromise.data;

  if (!currentTab) {
    return null;
  }

  return (
    <button
      onClick={async () => {
        if (isBlocked) {
          await removeFromBlockedWebsites(currentTab.url.hostname);
        } else {
          await addCurrentActiveTabToBlockedWebsites();
        }
      }}
    >
      {isBlocked ? "Unblock" : "Block"}
    </button>
  );
}
