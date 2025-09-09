import React from "react";
import { toggleEnabled } from "../model/enabled-storage.js";
import { i18n, type Dictionary } from "../model/i18n.ts";
import { useSyncEnabled } from "../store/enabled.js";
import { useI18n } from "../store/i18n.tsx";
import { useGlobalAskQuestionDialog } from "./ask-question-dialog.js";
import { Button } from "./button.js";

const dictionary = {
  enableBlocker: {
    [i18n.en.tag]: "Enable Blocker",
    [i18n.pt.tag]: "Habilitar bloqueador",
  },
  disableBlocker: {
    [i18n.en.tag]: "Disable Blocker",
    [i18n.pt.tag]: "Desabilitar bloqueador",
  },
} as const satisfies Dictionary;

export function ToggleBlocker() {
  const blocked = useSyncEnabled();

  const ask = useGlobalAskQuestionDialog();
  const text = useI18n(dictionary);
  const title = blocked ? text.disableBlocker : text.enableBlocker;

  const handleClick = async () => {
    if (blocked) {
      ask.wrap({
        fn: async () => {
          await toggleEnabled();
        },
      });
    } else {
      await toggleEnabled();
    }
  };

  return (
    <Button
      data-variant={blocked ? "secondary" : "primary"}
      onClick={handleClick}
      title={title}
      aria-label={title}
    >
      {title}
    </Button>
  );
}
