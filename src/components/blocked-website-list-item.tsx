import clsx from "clsx";
import { LucideTrash2 } from "lucide-react";
import React, { useState } from "react";
import { defaultFavicon } from "../model/favicon.js";
import type { Website } from "../model/website.js";
import {
  deleteBlockedWebsite,
  toggleBlockedWebsite,
} from "../store/blocked-websites.js";
import { useGlobalAskQuestionDialog } from "./ask-question-dialog.js";
import styles from "./blocked-website-list-item.module.css";
import { Button } from "./button.js";

export function BlockedWebsiteListItem({ website }: { website: Website }) {
  return (
    <li className={clsx(styles.listItem, website.blocked && styles.blocked)}>
      <Favicon website={website} />
      <div className={styles.content}>
        <h3 className={styles.title}>{website.title}</h3>
        <p className={styles.domain}>{website.domain}</p>
      </div>
      <div className={styles.actions}>
        <UnblockButton website={website} />
        <DeleteButton website={website} />
      </div>
    </li>
  );
}

function Favicon({ website }: { website: Website }) {
  const [src, setSrc] = useState(website.favicon);

  if (src === defaultFavicon) {
    const fallbackFavicon = website.domain.at(0) ?? "?";

    return (
      <div className={clsx(styles.favicon, styles.defaultFavicon)}>
        {fallbackFavicon}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={website.title}
      className={styles.favicon}
      onError={() => {
        setSrc(defaultFavicon);
      }}
    />
  );
}

function DeleteButton({ website }: { website: Website }) {
  const ask = useGlobalAskQuestionDialog();

  const handleClick = async () => {
    ask.wrap({
      fn: async () => {
        await deleteBlockedWebsite(website.domain);
      },
    });
  };

  return (
    <Button
      onClick={handleClick}
      data-variant="destructive"
      data-size="sm"
      aria-label="Delete"
      data-icon
      style={{ borderRadius: "var(--fm-c-radius-sm)" }}
    >
      <LucideTrash2 size={16} />
    </Button>
  );
}

function UnblockButton({ website }: { website: Website }) {
  const ask = useGlobalAskQuestionDialog();

  const handleClick = async () => {
    if (website.blocked) {
      ask.wrap({
        fn: async () => {
          await toggleBlockedWebsite(website.domain);
        },
      });
    } else {
      await toggleBlockedWebsite(website.domain);
    }
  };

  return (
    <Button
      onClick={handleClick}
      data-variant="tertiary"
      data-size="sm"
      aria-label="Unblock"
      style={{ borderRadius: "var(--fm-c-radius-sm)" }}
    >
      {website.blocked ? "Unblock" : "Block"}
    </Button>
  );
}
