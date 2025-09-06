import clsx from "clsx";
import React, { useState } from "react";
import { defaultFavicon } from "../model/favicon.js";
import type { Website } from "../model/website.js";
import {
  deleteBlockedWebsite,
  toggleBlockedWebsite,
} from "../store/blocked-websites.js";
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
  return (
    <Button
      onClick={async () => await deleteBlockedWebsite(website.domain)}
      data-variant="tertiary"
      data-size="sm"
    >
      Delete
    </Button>
  );
}

function UnblockButton({ website }: { website: Website }) {
  return (
    <Button
      onClick={async () => await toggleBlockedWebsite(website.domain)}
      data-variant="tertiary"
      data-size="sm"
    >
      {website.blocked ? "Unblock" : "Block"}
    </Button>
  );
}
