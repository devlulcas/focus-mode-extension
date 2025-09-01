import { useStore } from "@nanostores/react";
import React, { useEffect, useRef } from "react";
import { $blockedWebsitesAtom } from "../store/blocked-websites.js";
import { $enabledAtom } from "../store/enabled.js";

export function BlockedDialog() {
  const blockedWebsites = useStore($blockedWebsitesAtom);
  const enabled = useStore($enabledAtom);

  const currentDocumentIsBlocked = blockedWebsites.some(
    (b) => b.domain === window.location.hostname
  );

  const isBlocked = currentDocumentIsBlocked && enabled;

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isBlocked) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isBlocked]);

  return (
    <dialog
      ref={dialogRef}
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        placeContent: "center",
        padding: 16,
        borderRadius: 16,
      }}
    >
      <h1>Blocked</h1>
      <p>You are blocked from accessing this website.</p>
    </dialog>
  );
}
