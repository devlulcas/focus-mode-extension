import clsx from "clsx";
import { LucideTrash2 } from "lucide-react";
import React, { useState } from "react";
import { defaultFavicon } from "../model/favicon.js";
import { i18n, type Dictionary } from "../model/i18n.ts";
import type { Website } from "../model/website.js";
import {
  deleteBlockedWebsite,
  toggleBlockedWebsite,
} from "../store/blocked-websites.js";
import { useI18n } from "../store/i18n.tsx";
import { useGlobalAskQuestionDialog } from "./ask-question-dialog.js";
import styles from "./blocked-website-list-item.module.css";
import { Button } from "./button.js";

const dictionary = {
  delete: {
    [i18n.en.tag]: "Delete",
    [i18n.pt.tag]: "Deletar",
  },
  unblock: {
    [i18n.en.tag]: "Unblock",
    [i18n.pt.tag]: "Desbloquear",
  },
  block: {
    [i18n.en.tag]: "Block",
    [i18n.pt.tag]: "Bloquear",
  },
} as const satisfies Dictionary;

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
  const text = useI18n(dictionary);
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
      aria-label={text.delete}
      title={text.delete}
      data-icon
      style={{ borderRadius: "var(--fm-c-radius-sm)" }}
    >
      <LucideTrash2 size={16} />
    </Button>
  );
}

function UnblockButton({ website }: { website: Website }) {
  const ask = useGlobalAskQuestionDialog();
  const text = useI18n(dictionary);
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
      aria-label={text.unblock}
      title={text.unblock}
      style={{ borderRadius: "var(--fm-c-radius-sm)" }}
    >
      {website.blocked ? text.unblock : text.block}
    </Button>
  );
}
