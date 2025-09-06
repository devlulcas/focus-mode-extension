import React from "react";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useSyncEnabled } from "../store/enabled.js";
import styles from "./blocked-dialog.module.css";

export function BlockedDialog() {
  const blockedWebsites = useSyncBlockedWebsites();
  const enabled = useSyncEnabled();

  const currentDocumentIsBlocked = blockedWebsites.some(
    (b) => b.domain === window.location.hostname && b.blocked
  );

  const isBlocked = currentDocumentIsBlocked && enabled;

  if (!isBlocked) {
    return null;
  }

  return (
    <dialog
      ref={(el) => {
        if (el) {
          el.showModal();
        }
      }}
      className={styles.dialog}
      onClose={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.showModal();
      }}
    >
      <div className={styles.iconContainer}>
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className={styles.title}>Access Blocked</h1>
      <p className={styles.description}>
        You are blocked from accessing this website. Focus on your work!
      </p>
    </dialog>
  );
}
