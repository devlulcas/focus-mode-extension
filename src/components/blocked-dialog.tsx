import React, { useEffect, useRef } from "react";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useSyncEnabled } from "../store/enabled.js";

export function BlockedDialog() {
  const blockedWebsites = useSyncBlockedWebsites();
  const enabled = useSyncEnabled();

  const currentDocumentIsBlocked = blockedWebsites.some(
    (b) => b.domain === window.location.hostname && b.blocked
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
    <dialog ref={dialogRef}>
      <h1>Blocked</h1>
      <p>You are blocked from accessing this website.</p>
    </dialog>
  );
}
