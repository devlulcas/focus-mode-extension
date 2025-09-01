import { useStore } from "@nanostores/react";
import React from "react";
import { $enabledAtom } from "../store/enabled.js";

export function ToggleBlocker() {
  const enabled = useStore($enabledAtom);

  const toggleEnabled = () => {
    $enabledAtom.set(!enabled);
  };

  return (
    <button onClick={toggleEnabled}>
      {enabled ? "Disable" : "Enable"} Blocker
    </button>
  );
}
