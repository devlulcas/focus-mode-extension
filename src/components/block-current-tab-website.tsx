import React from "react";
import { useAsync } from "../hooks/use-async.js";
import { getCurrentActiveTab } from "../libs/tabs.js";
import {
  toggleCurrentActiveTabBlocking,
  useSyncBlockedWebsites,
} from "../store/blocked-websites.js";

export function BlockCurrentTabWebsite() {
  const blockedWebsites = useSyncBlockedWebsites();
  const currentTabPromise = useAsync(getCurrentActiveTab);

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

  const blockedWebsite = blockedWebsites.find(
    (b) => b.domain === currentTab.url.hostname
  );

  const isBlocked = Boolean(blockedWebsite?.blocked);

  return (
    <button
      onClick={async () => {
        await toggleCurrentActiveTabBlocking();
      }}
    >
      {isBlocked ? "Unblock" : "Block"} {currentTab.url.hostname}
    </button>
  );
}
