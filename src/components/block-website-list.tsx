import { LucideCat } from "lucide-react";
import React from "react";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import styles from "./block-website-list.module.css";
import { BlockedWebsiteListItem } from "./blocked-website-list-item.js";

export function BlockWebsiteList() {
  const blockedWebsites = useSyncBlockedWebsites();

  return (
    <ul className={styles.list}>
      {blockedWebsites.length === 0 && (
        <li className={styles.empty}>
          No blocked websites yet <LucideCat fill="currentColor" />
        </li>
      )}
      {blockedWebsites.map((website) => (
        <BlockedWebsiteListItem key={website.domain} website={website} />
      ))}
    </ul>
  );
}
