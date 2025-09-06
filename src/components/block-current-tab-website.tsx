import React from "react";
import { useAsync } from "../hooks/use-async.js";
import { getCurrentActiveTab } from "../libs/tabs.js";
import {
  toggleCurrentActiveTabBlocking,
  useSyncBlockedWebsites,
} from "../store/blocked-websites.js";
import { Button } from "./button.js";

export function BlockCurrentTabWebsite() {
  const blockedWebsites = useSyncBlockedWebsites();
  const currentTabPromise = useAsync(getCurrentActiveTab);

  const currentTab = currentTabPromise.data;

  const blockedWebsite = blockedWebsites.find(
    (b) => b.domain === currentTab?.url.hostname
  );

  const isBlocked = Boolean(blockedWebsite?.blocked);

  const handleClick = async () => {
    await toggleCurrentActiveTabBlocking();
  };

  if (currentTabPromise.loading) {
    return <Button data-loading>Loading...</Button>;
  }

  if (currentTabPromise.error) {
    return <Button data-error>Error</Button>;
  }

  if (!currentTab) {
    return null;
  }

  return (
    <Button
      data-variant={isBlocked ? "secondary" : "primary"}
      onClick={handleClick}
    >
      {isBlocked ? "Unblock" : "Block"} {currentTab.url.hostname}
    </Button>
  );
}
