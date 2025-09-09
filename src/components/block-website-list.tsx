import { LucideCat } from "lucide-react";
import React from "react";
import { i18n, type Dictionary } from "../model/i18n.ts";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useI18n } from "../store/i18n.tsx";
import styles from "./block-website-list.module.css";
import { BlockedWebsiteListItem } from "./blocked-website-list-item.js";

const dictionary = {
  noBlockedWebsites: {
    [i18n.en.tag]: "No blocked websites yet",
    [i18n.pt.tag]: "Nenhum site bloqueado ainda",
  },
} as const satisfies Dictionary;

export function BlockWebsiteList() {
  const blockedWebsites = useSyncBlockedWebsites();
  const text = useI18n(dictionary);
  return (
    <ul className={styles.list}>
      {blockedWebsites.length === 0 && (
        <li className={styles.empty}>
          {text.noBlockedWebsites} <LucideCat fill="currentColor" />
        </li>
      )}
      {blockedWebsites.map((website) => (
        <BlockedWebsiteListItem key={website.domain} website={website} />
      ))}
    </ul>
  );
}
