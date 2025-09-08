import { LucideLock, LucidePause, LucidePlay } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useSyncEnabled } from "../store/enabled.js";
import styles from "./blocked-dialog.module.css";
import { Button } from "./button.tsx";

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
          window.scrollTo(0, 0);
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
        <LucideLock className={styles.icon} size={48} />
      </div>
      <h1 className={styles.title}>Access Blocked</h1>
      <p className={styles.description}>
        You are blocked from accessing this website. Focus on your work!
      </p>
      <PauseMediaButton />

      <style>
        {`
          body {
            overflow: hidden !important;
            height: 100vh !important;
            width: 100vw !important;
          }
        `}
      </style>
    </dialog>
  );
}

function PauseMediaButton() {
  const [paused, setPaused] = useState<boolean[]>([]);
  const [els, setEls] = useState<(HTMLVideoElement | HTMLAudioElement)[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const fetchEls = useCallback(() => {
    const videoEls = document.querySelectorAll("video");
    const audioEls = document.querySelectorAll("audio");
    const elsWithPause = [...Array.from(videoEls), ...Array.from(audioEls)];
    setEls(elsWithPause);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (els.length === 0) {
        fetchEls();
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [fetchEls]);

  const pauseMedia = () => {
    fetchEls();

    const newPaused = els.map((el) => {
      if (el.paused === false) {
        el.pause();
        return true;
      }
      return false;
    });

    setPaused(newPaused);
    setIsPaused(true);
  };

  const resumeMedia = () => {
    paused.forEach((bool, index) => {
      if (bool) {
        els?.[index]?.play();
      }
    });

    setPaused(paused.map(() => false));
    setIsPaused(false);
  };

  const elsLength = els.length;
  const pausedLength = paused.filter(Boolean).length;
  const title =
    els.length > 0 ? `${pausedLength} of ${elsLength} elements paused` : "";

  const handleClick = () => {
    if (isPaused) {
      resumeMedia();
    } else {
      pauseMedia();
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <Button data-variant="primary" onClick={handleClick} title={title}>
        {isPaused ? "Resume Media" : "Pause Media"}
        {isPaused ? (
          <LucidePlay size={16} fill="currentColor" className={styles.icon} />
        ) : (
          <LucidePause size={16} fill="currentColor" className={styles.icon} />
        )}
      </Button>
    </div>
  );
}
