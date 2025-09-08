import React, { useEffect } from "react";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useSyncEnabled } from "../store/enabled.js";
import styles from "./blocked-dialog.module.css";

function pauseMedia() {
  const videoEls = document.querySelectorAll("video");
  const audioEls = document.querySelectorAll("audio");
  const elsWithPause = [...Array.from(videoEls), ...Array.from(audioEls)];

  elsWithPause.forEach((el) => {
    if (el.paused === false) {
      el.pause();
    }
  });
}

function createWindowScrollBlocker() {
  const computedStyle = window.getComputedStyle(document.body);

  const previous = {
    overflow: computedStyle.overflow,
    height: computedStyle.height,
    width: computedStyle.width,
  };

  const reset = () => {
    document.body.style.overflow = previous.overflow;
    document.body.style.height = previous.height;
    document.body.style.width = previous.width;
  };

  const block = () => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";
  };

  return {
    reset,
    block,
  };
}

const windowScrollBlocker = createWindowScrollBlocker();

export function BlockedDialog() {
  const blockedWebsites = useSyncBlockedWebsites();
  const enabled = useSyncEnabled();

  const currentDocumentIsBlocked = blockedWebsites.some(
    (b) => b.domain === window.location.hostname && b.blocked
  );

  const isBlocked = currentDocumentIsBlocked && enabled;

  useEffect(() => {
    if (isBlocked) {
      windowScrollBlocker.block();
      pauseMedia();
    } else {
      windowScrollBlocker.reset();
    }
  }, [isBlocked]);

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
