import React from "react";
import { useAsync } from "../hooks/use-async.js";
import { getCurrentActiveTab } from "../libs/tabs.js";
import { i18n, type Dictionary } from "../model/i18n.ts";
import {
  toggleCurrentActiveTabBlocking,
  useSyncBlockedWebsites,
} from "../store/blocked-websites.js";
import { useI18n } from "../store/i18n.tsx";
import { useGlobalAskQuestionDialog } from "./ask-question-dialog.js";
import { Button } from "./button.js";

const dictionary = {
  block: {
    [i18n.en.tag]: "Block",
    [i18n.pt.tag]: "Bloquear",
  },
  unblock: {
    [i18n.en.tag]: "Unblock",
    [i18n.pt.tag]: "Desbloquear",
  },
  loading: {
    [i18n.en.tag]: "Loading...",
    [i18n.pt.tag]: "Carregando...",
  },
  error: {
    [i18n.en.tag]: "Error",
    [i18n.pt.tag]: "Erro",
  },
} as const satisfies Dictionary;

export function BlockCurrentTabWebsite() {
  const blockedWebsites = useSyncBlockedWebsites();
  const currentTabPromise = useAsync(getCurrentActiveTab);

  const text = useI18n(dictionary);
  const currentTab = currentTabPromise.data;

  const blockedWebsite = blockedWebsites.find(
    (b) => b.domain === currentTab?.url.hostname
  );

  const isBlocked = Boolean(blockedWebsite?.blocked);

  const ask = useGlobalAskQuestionDialog();

  const handleClick = async () => {
    if (isBlocked) {
      ask.wrap({
        fn: async () => {
          await toggleCurrentActiveTabBlocking();
        },
      });
    } else {
      await toggleCurrentActiveTabBlocking();
    }
  };

  if (currentTabPromise.loading) {
    return <Button data-loading>{text.loading}</Button>;
  }

  if (currentTabPromise.error) {
    return <Button data-error>{text.error}</Button>;
  }

  if (!currentTab) {
    return null;
  }

  return (
    <Button
      data-variant={isBlocked ? "secondary" : "primary"}
      onClick={handleClick}
    >
      {isBlocked ? text.unblock : text.block} {currentTab.url.hostname}
    </Button>
  );
}
