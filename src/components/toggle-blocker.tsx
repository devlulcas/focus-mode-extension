import React from "react";
import { toggleEnabled } from "../model/enabled-storage.js";
import { useSyncEnabled } from "../store/enabled.js";
import { useGlobalAskQuestionDialog } from "./ask-question-dialog.js";
import { Button } from "./button.js";

export function ToggleBlocker() {
  const blocked = useSyncEnabled();

  const ask = useGlobalAskQuestionDialog();

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
    >
      {blocked ? "Disable Blocker" : "Enable Blocker"}
    </Button>
  );
}
