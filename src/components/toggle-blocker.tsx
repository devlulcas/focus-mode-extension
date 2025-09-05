import React from "react";
import { toggleEnabled } from "../model/enabled-storage.js";
import { useSyncEnabled } from "../store/enabled.js";

export function ToggleBlocker() {
  const enabled = useSyncEnabled();

  const handle = async () => {
    await toggleEnabled();
  };

  return (
    <button onClick={handle}>{enabled ? "Disable" : "Enable"} Blocker</button>
  );
}
